"""Shared fixtures for Vault integration tests."""

from __future__ import annotations

from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pytest_homeassistant.common import MockConfigEntry

from custom_components.vault.api.models import (
    ActivityEntry,
    Anomaly,
    AuthStatus,
    BackupJob,
    DiscoveredItem,
    Discovery,
    EncryptionStatus,
    HealthStatus,
    HealthSummary,
    JobRun,
    JobRunStatus,
    RestorePoint,
    Settings,
    StorageDestination,
    StorageTestResult,
    StorageType,
    VaultApiData,
)
from custom_components.vault.const import DOMAIN
from homeassistant.core import HomeAssistant

from .fixtures.deprecations import HANDLER as DEPRECATION_REPORTS  # noqa: TID251 - test-only helpers

MOCK_HOST = "192.168.1.100"
MOCK_PORT = 24085


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Enable custom integration discovery in all tests."""


@pytest.fixture(autouse=True)
def fail_on_ha_deprecation_reports() -> Generator[None]:
    """Fail when Home Assistant logs deprecated use by this integration.

    Reports logged while modules were imported surface on the first test.
    """
    yield
    if reports := DEPRECATION_REPORTS.pop_reports():
        pytest.fail(
            "Home Assistant reported deprecated use by vault:\n" + "\n".join(reports),
            pytrace=False,
        )


@pytest.fixture
def hass_config_dir(hass_tmp_config_dir: str) -> str:
    """Give every test its own temporary Home Assistant config directory.

    pytest-homeassistant points the config directory at `tests/testing_config`
    by default, so a test that writes configuration would write into the
    working tree.
    """
    return hass_tmp_config_dir


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    """Create a mock config entry for testing."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Vault (1.0.0)",
        data={
            "host": MOCK_HOST,
            "port": MOCK_PORT,
        },
        unique_id=f"{MOCK_HOST}:{MOCK_PORT}",
    )


@pytest.fixture
def mock_health() -> HealthStatus:
    """Return a mock HealthStatus."""
    return HealthStatus(status="ok", version="1.0.0")


@pytest.fixture
def mock_settings() -> Settings:
    """Return a mock Settings."""
    return Settings()


@pytest.fixture
def mock_encryption() -> EncryptionStatus:
    """Return a mock EncryptionStatus."""
    return EncryptionStatus(encryption_enabled=True)


@pytest.fixture
def mock_storage() -> list[StorageDestination]:
    """Return mock storage destinations."""
    return [
        StorageDestination(id=1, name="Local Backup", type=StorageType.LOCAL),
        StorageDestination(id=2, name="S3 Bucket", type=StorageType.S3, config="s3://my-bucket"),
    ]


@pytest.fixture
def mock_jobs() -> list[BackupJob]:
    """Return mock backup jobs."""
    return [
        BackupJob(id=1, name="Daily Backup", enabled=True, schedule="0 2 * * *"),
        BackupJob(id=2, name="Weekly Full", enabled=True, schedule="0 3 * * 0"),
        BackupJob(id=3, name="Disabled Job", enabled=False),
    ]


@pytest.fixture
def mock_job_runs() -> dict[int, list[JobRun]]:
    """Return mock job runs keyed by job ID."""
    return {
        1: [
            JobRun(
                id=101,
                job_id=1,
                status=JobRunStatus.COMPLETED,
                items_total=10,
                items_done=10,
                items_failed=0,
                size_bytes=1048576,
            )
        ],
        2: [
            JobRun(
                id=102,
                job_id=2,
                status=JobRunStatus.RUNNING,
                items_total=5,
                items_done=3,
                items_failed=0,
                size_bytes=524288,
            )
        ],
        3: [],
    }


@pytest.fixture
def mock_restore_point_counts() -> dict[int, int]:
    """Return mock restore point counts."""
    return {1: 5, 2: 3, 3: 0}


@pytest.fixture
def mock_activity() -> list[ActivityEntry]:
    """Return mock activity entries."""
    return [
        ActivityEntry(id=1, message="Backup completed", category="backup"),
    ]


@pytest.fixture
def mock_anomalies() -> list[Anomaly]:
    """Return mock open anomalies."""
    return [
        Anomaly(
            id=11,
            detector="size_drift",
            severity="critical",
            scope_kind="job",
            scope_id=1,
            metric="total_bytes_low",
            summary="backup shrank to 0 B (0% of expected 136.4 MB)",
            state="open",
        ),
    ]


@pytest.fixture
def mock_vault_data(
    mock_health: HealthStatus,
    mock_settings: Settings,
    mock_encryption: EncryptionStatus,
    mock_storage: list[StorageDestination],
    mock_jobs: list[BackupJob],
    mock_job_runs: dict[int, list[JobRun]],
    mock_restore_point_counts: dict[int, int],
    mock_activity: list[ActivityEntry],
    mock_anomalies: list[Anomaly],
) -> VaultApiData:
    """Return aggregated mock VaultApiData."""
    return VaultApiData(
        health=mock_health,
        runner_status={"job_id": None, "queue": []},
        settings=mock_settings,
        encryption=mock_encryption,
        storage=mock_storage,
        jobs=mock_jobs,
        job_runs=mock_job_runs,
        restore_point_counts=mock_restore_point_counts,
        activity=mock_activity,
        anomalies=mock_anomalies,
    )


@pytest.fixture
def mock_api_client(
    mock_health: HealthStatus,
    mock_settings: Settings,
    mock_encryption: EncryptionStatus,
    mock_storage: list[StorageDestination],
    mock_jobs: list[BackupJob],
    mock_activity: list[ActivityEntry],
    mock_anomalies: list[Anomaly],
) -> MagicMock:
    """Create a mocked VaultApiClient."""
    client = MagicMock()
    client.async_get_health = AsyncMock(return_value=mock_health)
    client.async_get_runner_status = AsyncMock(return_value={"job_id": None, "queue": []})
    client.async_ping = AsyncMock(return_value=True)
    client.async_get_settings = AsyncMock(return_value=mock_settings)
    client.async_update_settings = AsyncMock(return_value=mock_settings)
    client.async_get_encryption_status = AsyncMock(return_value=mock_encryption)
    client.async_get_storage = AsyncMock(return_value=mock_storage)
    client.async_test_storage = AsyncMock(return_value=StorageTestResult(success=True))
    client.async_get_jobs = AsyncMock(return_value=mock_jobs)
    client.async_get_job = AsyncMock()
    client.async_run_job = AsyncMock(return_value={"status": "started"})
    client.async_get_job_history = AsyncMock(
        side_effect=lambda job_id, **kwargs: (
            [
                JobRun(
                    id=100 + job_id,
                    job_id=job_id,
                    status=JobRunStatus.COMPLETED,
                    items_total=10,
                    items_done=10,
                    items_failed=0,
                    size_bytes=1048576,
                )
            ]
            if job_id != 3
            else []
        )
    )
    client.async_get_restore_points = AsyncMock(
        side_effect=lambda job_id: (
            [RestorePoint(id=i, job_run_id=100, job_id=job_id) for i in range(1, 6)]
            if job_id == 1
            else [RestorePoint(id=i, job_run_id=100, job_id=job_id) for i in range(1, 4)]
            if job_id == 2
            else []
        )
    )
    client.async_restore = AsyncMock(return_value={"status": "started"})
    client.async_get_activity = AsyncMock(return_value=mock_activity)
    client.async_get_anomalies = AsyncMock(return_value=mock_anomalies)
    client.async_get_auth_status = AsyncMock(return_value=AuthStatus(auth_required=False))
    # Shapes captured from a Vault 2026.10.04 daemon.
    client.async_get_next_runs = AsyncMock(return_value={"1": "2026-11-06 02:00:00", "2": "2026-11-08 03:00:00"})
    client.async_get_coverage_summary = AsyncMock(
        return_value=HealthSummary(
            total_items=3,
            protected_items=2,
            protected_keys=["container:plex", "vm:Home Assistant"],
            pending_keys=["container:sonarr"],
        )
    )
    discovery = {
        "containers": Discovery(
            available=True,
            items=[
                DiscoveredItem(name="plex", type="container"),
                DiscoveredItem(name="sonarr", type="container"),
                DiscoveredItem(name="radarr", type="container"),
            ],
        ),
        "vms": Discovery(available=True, items=[DiscoveredItem(name="Home Assistant", type="vm")]),
        "folders": Discovery(
            available=True,
            items=[DiscoveredItem(name="Flash Drive", type="folder", settings={"preset": "flash"})],
        ),
    }
    client.async_discover = AsyncMock(side_effect=lambda kind: discovery[kind])
    return client


@pytest.fixture
def mock_websocket() -> MagicMock:
    """Create a mocked VaultWebSocketClient."""
    ws = MagicMock()
    ws.async_connect = AsyncMock()
    ws.async_disconnect = AsyncMock()
    ws.connected = True
    ws.register_listener = MagicMock(return_value=MagicMock())
    return ws


@pytest.fixture
async def mock_setup_entry(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_api_client: MagicMock,
    mock_websocket: MagicMock,
) -> MockConfigEntry:
    """Set up a Vault config entry with mocked dependencies."""
    mock_config_entry.add_to_hass(hass)

    with (
        patch(
            "custom_components.vault.VaultApiClient",
            return_value=mock_api_client,
        ),
        patch(
            "custom_components.vault.VaultWebSocketClient",
            return_value=mock_websocket,
        ),
    ):
        await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    return mock_config_entry
