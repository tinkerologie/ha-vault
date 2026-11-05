"""DataUpdateCoordinator and runtime data for the Vault integration."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from pydantic import ValidationError

from homeassistant.config_entries import ConfigEntry
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .api import VaultApiClient, VaultApiError, VaultAuthenticationError, VaultConnectionError, VaultWebSocketClient
from .api.models import Coverage, Discovery, HealthSummary, Settings, VaultApiData
from .const import (
    ACTIVE_UPDATE_INTERVAL_SECONDS,
    COVERAGE_UPDATE_INTERVAL_SECONDS,
    DEFAULT_UPDATE_INTERVAL_SECONDS,
    LOGGER,
)
from .runs import HISTORY_LIMIT

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant


type VaultConfigEntry = ConfigEntry[VaultData]


@dataclass
class TrackedRun:
    """The backup or restore Vault is running, as seen through WebSocket events."""

    job_id: int
    run_id: int | None = None
    processed: int = 0
    """Items finished, successfully or not."""
    total: int = 0
    finished: bool = False


@dataclass
class VaultData:
    """Runtime data stored in config entry."""

    client: VaultApiClient
    coordinator: VaultDataUpdateCoordinator
    websocket: VaultWebSocketClient
    progress: dict[int, int] = field(default_factory=dict)
    """Live backup progress per job id, fed by WebSocket events."""
    current_run: TrackedRun | None = None
    """The job Vault is backing up and its item counts, from WebSocket events."""


def parse_next_runs(raw: dict[str, Any]) -> dict[int, datetime]:
    """Parse the daemon's next-run map into aware datetimes keyed by job id.

    The daemon formats times as ``YYYY-MM-DD HH:MM:SS`` in its own local
    time without an offset. Vault runs on the Unraid host, which normally
    shares Home Assistant's time zone, so a naive time is read in Home
    Assistant's time zone. A time that carries an offset is used as is.
    """
    next_runs: dict[int, datetime] = {}
    for job_id, value in raw.items():
        if not isinstance(value, str) or not str(job_id).isdigit():
            continue
        parsed = dt_util.parse_datetime(value.replace(" ", "T", 1))
        if parsed is None:
            continue
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt_util.get_default_time_zone())
        next_runs[int(job_id)] = parsed
    return next_runs


def compute_coverage(summary: HealthSummary, settings: Settings, discovery: dict[str, Discovery] | None) -> Coverage:
    """Count protected and unprotected items like Vault's own dashboard.

    Items are the discovered containers, VMs, folders and flash presets
    whose backup category is enabled in Vault's settings. Without discovery,
    only the summary's counts of items in jobs are known.
    """
    protected_keys = set(summary.protected_keys)
    pending_keys = set(summary.pending_keys) - protected_keys
    if discovery is None:
        return Coverage(protected=summary.protected_items, pending=len(pending_keys))

    extra = settings.model_extra or {}

    def enabled(setting: str) -> bool:
        return str(extra.get(setting, "true")).lower() != "false"

    empty = Discovery(available=True)
    tracked: set[str] = set()
    if enabled("container_backup_enabled"):
        tracked.update(item.key for item in discovery.get("containers", empty).items)
    if enabled("vm_backup_enabled"):
        tracked.update(item.key for item in discovery.get("vms", empty).items)
    for item in discovery.get("folders", empty).items:
        is_flash = item.settings.get("preset") == "flash"
        if enabled("flash_backup_enabled" if is_flash else "folder_backup_enabled"):
            tracked.add(item.key)

    unprotected = sorted(tracked - protected_keys)
    return Coverage(
        protected=len(tracked & protected_keys),
        pending=len(tracked & pending_keys),
        unprotected=len(unprotected),
        unprotected_keys=unprotected,
    )


class VaultDataUpdateCoordinator(DataUpdateCoordinator[VaultApiData]):
    """Coordinator that polls the Vault API for all data."""

    config_entry: VaultConfigEntry

    def __init__(self, hass: HomeAssistant, client: VaultApiClient) -> None:
        """Initialize the coordinator.

        Args:
            hass: Home Assistant instance.
            client: Vault API client.
        """
        super().__init__(
            hass,
            LOGGER,
            name="vault",
            update_interval=timedelta(seconds=DEFAULT_UPDATE_INTERVAL_SECONDS),
        )
        self.client = client
        self._coverage: Coverage | None = None
        self._coverage_fetched_at: datetime | None = None

    @staticmethod
    def _job_run_status_text(status: object) -> str:
        """Return normalized lowercase status text for enum/string values."""
        return str(getattr(status, "value", status)).lower()

    async def _fetch_job_data(self, job_id: int, semaphore: asyncio.Semaphore) -> tuple[int, list, int]:
        """Fetch latest runs and restore point count for one job."""
        async with semaphore:
            try:
                runs = await self.client.async_get_job_history(job_id, limit=HISTORY_LIMIT)
                restore_points = await self.client.async_get_restore_points(job_id)
            except VaultAuthenticationError:
                # Must propagate so the reauth flow is triggered.
                raise
            except VaultApiError as err:
                LOGGER.warning("Failed fetching per-job data for job_id=%s: %s", job_id, err)
                return job_id, [], 0

        return job_id, runs, len(restore_points)

    async def _fetch_next_runs(self) -> dict[int, datetime]:
        """Fetch next scheduled runs; an older daemon without the endpoint gives none."""
        try:
            raw = await self.client.async_get_next_runs()
        except VaultAuthenticationError:
            raise
        except VaultApiError as err:
            LOGGER.debug("Next runs unavailable: %s", err)
            return {}
        return parse_next_runs(raw) if isinstance(raw, dict) else {}

    async def _fetch_coverage(self, settings: Settings) -> Coverage | None:
        """Return item coverage, refreshed at most every few minutes.

        Coverage is optional: when the daemon can't provide it, the last known
        value is kept and the rest of the update carries on.
        """
        now = dt_util.utcnow()
        if self._coverage_fetched_at is not None and now - self._coverage_fetched_at < timedelta(
            seconds=COVERAGE_UPDATE_INTERVAL_SECONDS
        ):
            return self._coverage
        try:
            summary = await self.client.async_get_coverage_summary()
        except VaultAuthenticationError:
            raise
        except (VaultApiError, ValidationError) as err:
            LOGGER.debug("Coverage summary unavailable: %s", err)
            return self._coverage

        discovery: dict[str, Discovery] | None = {}
        extra = settings.model_extra or {}
        enabled_kinds = [
            kind
            for kind, setting_names in (
                ("containers", ("container_backup_enabled",)),
                ("vms", ("vm_backup_enabled",)),
                ("folders", ("folder_backup_enabled", "flash_backup_enabled")),
            )
            if any(str(extra.get(name, "true")).lower() != "false" for name in setting_names)
        ]
        try:
            for kind in enabled_kinds:
                result = await self.client.async_discover(kind)
                if not result.available:
                    discovery = None
                    break
                discovery[kind] = result  # type: ignore[index]
        except VaultAuthenticationError:
            raise
        except (VaultApiError, ValidationError) as err:
            # Replica daemons don't serve discovery endpoints.
            LOGGER.debug("Discovery unavailable, counting job items only: %s", err)
            discovery = None

        self._coverage = compute_coverage(summary, settings, discovery)
        self._coverage_fetched_at = now
        return self._coverage

    async def _async_update_data(self) -> VaultApiData:
        """Fetch data from all Vault API endpoints.

        Returns:
            Aggregated VaultApiData.

        Raises:
            UpdateFailed: On communication errors.
        """
        try:
            health = await self.client.async_get_health()
            runner_status = await self.client.async_get_runner_status()
            settings = await self.client.async_get_settings()
            encryption = await self.client.async_get_encryption_status()
            storage = await self.client.async_get_storage()
            jobs = await self.client.async_get_jobs()
            activity = await self.client.async_get_activity()
            anomalies = await self.client.async_get_anomalies(state="open")

            # Fetch most recent run + restore points per job (bounded parallelism)
            semaphore = asyncio.Semaphore(5)
            results = await asyncio.gather(*(self._fetch_job_data(job.id, semaphore) for job in jobs))
            job_runs: dict[int, list] = {job_id: runs for job_id, runs, _ in results}
            restore_point_counts: dict[int, int] = {job_id: rp_count for job_id, _, rp_count in results}
            next_runs = await self._fetch_next_runs()
            coverage = await self._fetch_coverage(settings)

        except VaultConnectionError as err:
            raise UpdateFailed(f"Error communicating with Vault: {err}") from err
        except VaultAuthenticationError as err:
            raise ConfigEntryAuthFailed(f"Authentication failed: {err}") from err
        except VaultApiError as err:
            raise UpdateFailed(f"Vault API error: {err}") from err
        except ValidationError as err:
            # Defense in depth: a payload shape we don't handle yet must mark
            # the update failed, not crash with an unexpected-error traceback.
            raise UpdateFailed(f"Unexpected Vault API payload: {err}") from err

        data = VaultApiData(
            health=health,
            runner_status=runner_status,
            settings=settings,
            encryption=encryption,
            storage=storage,
            jobs=jobs,
            job_runs=job_runs,
            restore_point_counts=restore_point_counts,
            activity=activity,
            anomalies=anomalies,
            next_runs=next_runs,
            coverage=coverage,
        )

        # Adjust polling rate: faster when a job is running
        has_running = any(runs and self._job_run_status_text(runs[0].status) == "running" for runs in job_runs.values())
        new_interval = ACTIVE_UPDATE_INTERVAL_SECONDS if has_running else DEFAULT_UPDATE_INTERVAL_SECONDS
        self.update_interval = timedelta(seconds=new_interval)

        return data
