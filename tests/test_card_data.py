"""Tests for the data behind the dashboard cards: next runs, coverage, 3-2-1 and the entity map."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from pytest_homeassistant.common import MockConfigEntry
from pytest_homeassistant.typing import WebSocketGenerator

from custom_components.vault.api import VaultApiClient, VaultApiError, VaultAuthenticationError
from custom_components.vault.api.models import (
    BackupJob,
    DiscoveredItem,
    Discovery,
    HealthSummary,
    JobRun,
    Settings,
    StorageDestination,
    StorageType,
    VaultApiData,
)
from custom_components.vault.coordinator import compute_coverage, parse_next_runs
from custom_components.vault.sensor import _destinations_in_use_attributes, _job_status, _next_backup
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util


def _state(hass: HomeAssistant, entry: MockConfigEntry, key: str):
    """Return the state of the entity with unique ID suffix ``key``."""
    entity_id = er.async_get(hass).async_get_entity_id("sensor", "vault", f"{entry.entry_id}_{key}") or er.async_get(
        hass
    ).async_get_entity_id("binary_sensor", "vault", f"{entry.entry_id}_{key}")
    assert entity_id is not None, key
    return hass.states.get(entity_id)


async def test_coverage_sensors(hass: HomeAssistant, mock_setup_entry: MockConfigEntry) -> None:
    """Coverage counts discovered items, not only the items jobs already cover."""
    assert _state(hass, mock_setup_entry, "protected_items").state == "2"
    unprotected = _state(hass, mock_setup_entry, "unprotected_items")
    assert unprotected.state == "3"
    assert unprotected.attributes["pending_items"] == 1
    assert unprotected.attributes["items"] == ["container:radarr", "container:sonarr", "folder:Flash Drive"]


async def test_next_backup_and_job_next_run(hass: HomeAssistant, mock_setup_entry: MockConfigEntry) -> None:
    """Next runs are read in Home Assistant's time zone and the earliest enabled job wins."""
    tz = dt_util.get_default_time_zone()
    expected = datetime(2026, 11, 6, 2, 0, tzinfo=tz)
    next_backup = _state(hass, mock_setup_entry, "next_backup")
    assert dt_util.parse_datetime(next_backup.state) == expected
    assert next_backup.attributes["job_name"] == "Daily Backup"
    assert dt_util.parse_datetime(_state(hass, mock_setup_entry, "job_2_next_run").state) == datetime(
        2026, 11, 8, 3, 0, tzinfo=tz
    )
    assert _state(hass, mock_setup_entry, "job_3_next_run").state == "unknown"


async def test_job_status_enum_and_attributes(hass: HomeAssistant, mock_setup_entry: MockConfigEntry) -> None:
    """The job status sensor is an enum and reports whether the job is enabled."""
    status = _state(hass, mock_setup_entry, "job_3_status")
    assert status.state == "idle"
    assert status.attributes["enabled"] is False
    assert "failed" in status.attributes["options"]
    assert _state(hass, mock_setup_entry, "job_1_status").attributes["schedule"] == "0 2 * * *"


def test_job_status_aliases_and_unknown(mock_vault_data: VaultApiData) -> None:
    """Daemon aliases map to known options; unknown statuses become unknown, not a raw string."""
    mock_vault_data.job_runs[1] = [JobRun(id=1, job_id=1, status="error")]
    assert _job_status(mock_vault_data, 1) == "failed"
    mock_vault_data.job_runs[1] = [JobRun(id=1, job_id=1, status="exploded")]
    assert _job_status(mock_vault_data, 1) is None


def test_next_backup_ignores_disabled_jobs(mock_vault_data: VaultApiData) -> None:
    """A disabled job's schedule doesn't count as the next backup."""
    tz = dt_util.get_default_time_zone()
    mock_vault_data.next_runs = {
        3: datetime(2026, 11, 5, 1, 0, tzinfo=tz),
        2: datetime(2026, 11, 7, 1, 0, tzinfo=tz),
    }
    assert _next_backup(mock_vault_data) == datetime(2026, 11, 7, 1, 0, tzinfo=tz)
    mock_vault_data.next_runs = {}
    assert _next_backup(mock_vault_data) is None


def test_destinations_in_use(mock_vault_data: VaultApiData) -> None:
    """Only destinations that enabled jobs wrote restore points to count, and the media/remote split."""
    mock_vault_data.storage = [
        StorageDestination(id=1, name="Array", type=StorageType.LOCAL),
        StorageDestination(id=2, name="Bucket", type=StorageType.S3),
        StorageDestination(id=3, name="Unused", type=StorageType.SMB),
    ]
    mock_vault_data.jobs = [
        BackupJob(id=1, name="A", enabled=True, storage_dest_id=1),
        BackupJob(id=2, name="B", enabled=True, storage_dest_id=2),
        BackupJob(id=3, name="C", enabled=False, storage_dest_id=3),
    ]
    mock_vault_data.restore_point_counts = {1: 2, 2: 1, 3: 4}
    assert _destinations_in_use_attributes(mock_vault_data) == {
        "media_types": 2,
        "remote_destinations": 1,
        "destinations": ["Array", "Bucket"],
    }
    mock_vault_data.restore_point_counts = {1: 2, 2: 0}
    assert _destinations_in_use_attributes(mock_vault_data)["destinations"] == ["Array"]


def test_parse_next_runs() -> None:
    """Naive daemon times get Home Assistant's zone; offsets are kept; junk is skipped."""
    parsed = parse_next_runs(
        {"1": "2026-11-06 12:30:00", "2": "2026-11-06T02:30:00+00:00", "x": "2026-11-06 12:30:00", "3": "soon"}
    )
    assert parsed == {
        1: datetime(2026, 11, 6, 12, 30, tzinfo=dt_util.get_default_time_zone()),
        2: datetime(2026, 11, 6, 2, 30, tzinfo=dt_util.UTC),
    }


def test_compute_coverage_respects_settings_and_missing_discovery() -> None:
    """Disabled categories aren't tracked; without discovery only job items are known."""
    summary = HealthSummary(protected_items=1, protected_keys=["container:plex"], pending_keys=["vm:Win"])
    discovery = {
        "containers": Discovery(available=True, items=[DiscoveredItem(name="plex", type="container")]),
        "vms": Discovery(available=True, items=[DiscoveredItem(name="Win", type="vm")]),
        "folders": Discovery(
            available=True, items=[DiscoveredItem(name="Flash", type="folder", settings={"preset": "flash"})]
        ),
    }
    settings = Settings.model_validate({"vm_backup_enabled": "false", "flash_backup_enabled": "false"})
    coverage = compute_coverage(summary, settings, discovery)
    assert (coverage.protected, coverage.pending, coverage.unprotected) == (1, 0, 0)

    coverage = compute_coverage(summary, Settings(), None)
    assert (coverage.protected, coverage.pending, coverage.unprotected) == (1, 1, None)


async def test_coverage_unavailable_on_old_daemon(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_api_client: MagicMock, mock_websocket: MagicMock
) -> None:
    """A daemon without the summary/next-run endpoints still loads; the new sensors are unavailable."""
    mock_api_client.async_get_coverage_summary = AsyncMock(side_effect=VaultApiError("404"))
    mock_api_client.async_get_next_runs = AsyncMock(side_effect=VaultApiError("404"))
    mock_config_entry.add_to_hass(hass)
    with (
        patch("custom_components.vault.VaultApiClient", return_value=mock_api_client),
        patch("custom_components.vault.VaultWebSocketClient", return_value=mock_websocket),
    ):
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    assert _state(hass, mock_config_entry, "protected_items").state == "unavailable"
    assert _state(hass, mock_config_entry, "unprotected_items").state == "unavailable"
    assert _state(hass, mock_config_entry, "next_backup").state == "unknown"
    assert _state(hass, mock_config_entry, "vault_status").state == "ok"


async def test_discovery_unavailable_counts_job_items_only(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_api_client: MagicMock, mock_websocket: MagicMock
) -> None:
    """When Docker or libvirt can't be listed, protected is known but unprotected isn't."""
    mock_api_client.async_discover = AsyncMock(return_value=Discovery(available=False))
    mock_config_entry.add_to_hass(hass)
    with (
        patch("custom_components.vault.VaultApiClient", return_value=mock_api_client),
        patch("custom_components.vault.VaultWebSocketClient", return_value=mock_websocket),
    ):
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    assert _state(hass, mock_config_entry, "protected_items").state == "2"
    assert _state(hass, mock_config_entry, "unprotected_items").state == "unavailable"


async def test_coverage_auth_error_triggers_reauth(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_api_client: MagicMock, mock_websocket: MagicMock
) -> None:
    """Authentication errors from the optional endpoints still start reauth."""
    mock_api_client.async_get_coverage_summary = AsyncMock(side_effect=VaultAuthenticationError("401"))
    mock_config_entry.add_to_hass(hass)
    with (
        patch("custom_components.vault.VaultApiClient", return_value=mock_api_client),
        patch("custom_components.vault.VaultWebSocketClient", return_value=mock_websocket),
    ):
        assert not await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()
    assert any(flow["context"]["source"] == "reauth" for flow in hass.config_entries.flow.async_progress())


async def test_discovery_client_unwraps_items() -> None:
    """Discovery responses are wrapped in {"items": [...], "available": bool}."""
    client = VaultApiClient.__new__(VaultApiClient)
    wrapped = {"available": True, "items": [{"name": "plex", "type": "container", "settings": {}}]}
    with patch.object(client, "_request", AsyncMock(return_value=wrapped)):
        assert await client.async_get_containers() == [{"name": "plex", "type": "container", "settings": {}}]
        result = await client.async_discover("containers")
    assert result.available is True
    assert result.items[0].key == "container:plex"

    failed = {"available": False, "items": [], "error": "no docker"}
    with patch.object(client, "_request", AsyncMock(return_value=failed)):
        assert (await client.async_discover("vms")).available is False


async def test_websocket_entity_map(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, hass_ws_client: WebSocketGenerator
) -> None:
    """The entity map groups entities by server, job and storage, keyed by translation key."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "vault/entity_map"})
    msg = await client.receive_json()
    assert msg["success"]
    (entry,) = msg["result"]["entries"]
    registry = er.async_get(hass)
    assert entry["entry_id"] == mock_setup_entry.entry_id
    assert entry["device_id"] is not None
    assert entry["entities"]["vault_status"] == "sensor.vault_backup_status"
    assert entry["entities"]["vault_online"].startswith("binary_sensor.")
    assert "next_backup" in entry["entities"]
    # Disabled-by-default entities are left out.
    assert "jobs_total" not in entry["entities"]

    assert [job["name"] for job in entry["jobs"]] == ["Daily Backup", "Disabled Job", "Weekly Full"]
    daily = entry["jobs"][0]
    assert daily["job_id"] == 1
    for role in ("job_status", "job_next_run", "job_running", "job_problem", "job_last_success", "run_backup"):
        reg = registry.async_get(daily["entities"][role])
        assert reg is not None
        assert reg.unique_id.startswith(f"{mock_setup_entry.entry_id}_job_1_")
    assert [dest["name"] for dest in entry["storage"]] == ["Local Backup", "S3 Bucket"]
    assert set(entry["storage"][0]["entities"]) >= {"storage_health", "storage_free_space", "storage_type"}


async def test_websocket_entity_map_follows_renamed_entity(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, hass_ws_client: WebSocketGenerator
) -> None:
    """A user-renamed entity ID is still found, because lookup uses the registry, not the ID."""
    registry = er.async_get(hass)
    old = registry.async_get_entity_id("sensor", "vault", f"{mock_setup_entry.entry_id}_job_1_status")
    assert old is not None
    registry.async_update_entity(old, new_entity_id="sensor.my_renamed_job")
    await hass.async_block_till_done()

    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "vault/entity_map"})
    msg = await client.receive_json()
    daily = msg["result"]["entries"][0]["jobs"][0]
    assert daily["entities"]["job_status"] == "sensor.my_renamed_job"


async def test_progress_from_item_events(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, mock_websocket: MagicMock
) -> None:
    """Job progress combines the item count with the current item's percent.

    Vault's per-item ``backup_progress`` events often carry no job id; they
    belong to the run announced by ``item_backup_start``.
    """
    from custom_components.vault.api.models import WebSocketEvent  # noqa: PLC0415

    listeners = [call.args[0] for call in mock_websocket.register_listener.call_args_list]
    entity_id = er.async_get(hass).async_get_entity_id("sensor", "vault", f"{mock_setup_entry.entry_id}_job_1_progress")
    assert entity_id is not None

    def send(**payload: object) -> None:
        event = WebSocketEvent.model_validate(payload)
        for listener in listeners:
            listener(event)

    send(type="job_run_started", job_id=1, run_id=5)
    send(type="item_backup_start", job_id=1, run_id=5, items_total=4, items_done=2, item_name="plex")
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == "50"

    send(type="backup_progress", item_name="plex", percent=50)  # no job id
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == "62"

    send(type="job_run_completed", job_id=1, run_id=5, status="completed")
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == "0"
    run = mock_setup_entry.runtime_data.current_run
    assert run is not None
    assert (run.job_id, run.run_id, run.finished) == (1, 5, True)


def test_restore_runs_dont_count_as_backups(mock_vault_data: VaultApiData) -> None:
    """Backup sensors describe the latest backup; a running restore shows as restoring."""
    from custom_components.vault.binary_sensor import _is_job_last_success, _is_job_running  # noqa: PLC0415
    from custom_components.vault.sensor import _job_last_run, _job_last_size  # noqa: PLC0415

    backup_done = datetime(2026, 11, 5, 3, 0, tzinfo=dt_util.UTC)
    restore_done = datetime(2026, 11, 5, 5, 0, tzinfo=dt_util.UTC)
    backup = JobRun(id=1, job_id=1, status="completed", run_type="backup", completed_at=backup_done, size_bytes=100)
    finished_restore = JobRun(
        id=2, job_id=1, status="failed", run_type="restore", completed_at=restore_done, size_bytes=5
    )
    mock_vault_data.job_runs[1] = [finished_restore, backup]
    assert _job_status(mock_vault_data, 1) == "completed"
    assert _job_last_run(mock_vault_data, 1) == backup_done
    assert _job_last_size(mock_vault_data, 1) == 100
    assert _is_job_last_success(mock_vault_data, 1) is True
    assert _is_job_running(mock_vault_data, 1) is False

    running_restore = JobRun(id=3, job_id=1, status="running", run_type="restore")
    mock_vault_data.job_runs[1] = [running_restore, backup]
    assert _job_status(mock_vault_data, 1) == "restoring"
    assert _is_job_running(mock_vault_data, 1) is True

    running_backup = JobRun(id=4, job_id=1, status="running", run_type="backup")
    mock_vault_data.job_runs[1] = [running_backup, backup]
    assert _job_status(mock_vault_data, 1) == "running"
    # A backup still in progress doesn't change whether the last one succeeded.
    assert _is_job_last_success(mock_vault_data, 1) is True


async def test_restore_progress_from_events(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, mock_websocket: MagicMock
) -> None:
    """Restore progress events update the job's progress like backups do."""
    from custom_components.vault.api.models import WebSocketEvent  # noqa: PLC0415

    listeners = [call.args[0] for call in mock_websocket.register_listener.call_args_list]
    entity_id = er.async_get(hass).async_get_entity_id("sensor", "vault", f"{mock_setup_entry.entry_id}_job_2_progress")
    assert entity_id is not None

    def send(**payload: object) -> None:
        for listener in listeners:
            listener(WebSocketEvent.model_validate(payload))

    send(type="job_run_started", job_id=2, run_id=9, run_type="restore", items_total=2)
    send(type="restore_progress", job_id=2, run_id=9, items_done=1, items_total=2, percent=50)
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == "75"


async def test_progress_ignores_late_and_out_of_order_events(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, mock_websocket: MagicMock
) -> None:
    """Progress never goes backwards in a run, and events after completion are ignored."""
    from custom_components.vault.api.models import WebSocketEvent  # noqa: PLC0415

    listeners = [call.args[0] for call in mock_websocket.register_listener.call_args_list]
    progress = mock_setup_entry.runtime_data.progress

    def send(**payload: object) -> None:
        for listener in listeners:
            listener(WebSocketEvent.model_validate(payload))

    send(type="item_backup_start", job_id=1, items_total=2, items_done=1)
    send(type="backup_progress", percent=60)
    assert progress[1] == 80
    send(type="backup_progress", percent=40)  # late event for the same item
    assert progress[1] == 80
    send(type="item_backup_start", job_id=1, items_total=2, items_done=1)  # repeated start
    assert progress[1] == 80
    send(type="job_run_completed", job_id=1, status="completed")
    send(type="backup_progress", job_id=1, percent=99)  # after completion
    assert 1 not in progress


async def test_restore_runs_fire_restore_events(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, mock_websocket: MagicMock
) -> None:
    """A restore fires vault_restore_* bus events and restore_* entity events, never backup ones."""
    from pytest_homeassistant.common import async_capture_events  # noqa: PLC0415

    from custom_components.vault.api.models import WebSocketEvent  # noqa: PLC0415

    listeners = [call.args[0] for call in mock_websocket.register_listener.call_args_list]
    started = async_capture_events(hass, "vault_restore_started")
    completed = async_capture_events(hass, "vault_restore_completed")
    backup_completed = async_capture_events(hass, "vault_backup_completed")

    for payload in (
        {"type": "job_run_started", "job_id": 1, "run_type": "restore", "items_total": 1},
        {"type": "job_run_completed", "job_id": 1, "run_type": "restore", "status": "completed"},
    ):
        for listener in listeners:
            listener(WebSocketEvent.model_validate(payload))
    await hass.async_block_till_done()

    assert len(started) == 1
    assert len(completed) == 1
    assert backup_completed == []
    entity_id = er.async_get(hass).async_get_entity_id(
        "event", "vault", f"{mock_setup_entry.entry_id}_job_1_last_event"
    )
    state = hass.states.get(entity_id)
    assert state.attributes["event_type"] == "restore_completed"
    assert state.attributes["run_type"] == "restore"


async def test_progress_follows_run_ids(
    hass: HomeAssistant, mock_setup_entry: MockConfigEntry, mock_websocket: MagicMock
) -> None:
    """A new run of the same job is tracked after a finished one; late events from old runs are ignored.

    Failed items count as processed.
    """
    from custom_components.vault.api.models import WebSocketEvent  # noqa: PLC0415

    listeners = [call.args[0] for call in mock_websocket.register_listener.call_args_list]
    progress = mock_setup_entry.runtime_data.progress

    def send(**payload: object) -> None:
        for listener in listeners:
            listener(WebSocketEvent.model_validate(payload))

    send(type="job_run_completed", job_id=1, run_id=7, status="completed")
    # Home Assistant reconnects in the middle of run 8: no start event.
    send(type="backup_progress", job_id=1, run_id=8, percent=30)
    assert progress[1] == 30
    # A late completion of run 7 doesn't clear run 8.
    send(type="job_run_completed", job_id=1, run_id=7, status="completed")
    assert progress[1] == 30
    # Four items, one failed and one done; the third is half way.
    send(type="item_backup_start", job_id=1, run_id=8, items_total=4, items_done=1, items_failed=1)
    send(type="backup_progress", run_id=8, percent=50)
    assert progress[1] == 62
    send(type="job_run_completed", job_id=1, run_id=8, status="completed")
    assert 1 not in progress


def test_running_backup_keeps_previous_backup_metrics(mock_vault_data: VaultApiData) -> None:
    """While a new backup runs, last run and size still describe the last finished backup."""
    from custom_components.vault.sensor import _job_last_run, _job_last_size  # noqa: PLC0415

    done_at = datetime(2026, 11, 5, 3, 0, tzinfo=dt_util.UTC)
    finished = JobRun(id=1, job_id=1, status="completed", run_type="backup", completed_at=done_at, size_bytes=100)
    running = JobRun(id=2, job_id=1, status="running", run_type="backup")
    mock_vault_data.job_runs[1] = [running, finished]
    assert _job_status(mock_vault_data, 1) == "running"
    assert _job_last_run(mock_vault_data, 1) == done_at
    assert _job_last_size(mock_vault_data, 1) == 100


async def test_disabled_category_discovery_not_required(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry, mock_api_client: MagicMock, mock_websocket: MagicMock
) -> None:
    """With VM backups off, libvirt being down doesn't make coverage unknown."""
    mock_api_client.async_get_settings = AsyncMock(return_value=Settings.model_validate({"vm_backup_enabled": "false"}))
    original = mock_api_client.async_discover.side_effect

    def discover(kind: str) -> Discovery:
        if kind == "vms":
            raise AssertionError("VM discovery must not be called when VM backups are off")
        return original(kind)

    mock_api_client.async_discover = AsyncMock(side_effect=discover)
    mock_config_entry.add_to_hass(hass)
    with (
        patch("custom_components.vault.VaultApiClient", return_value=mock_api_client),
        patch("custom_components.vault.VaultWebSocketClient", return_value=mock_websocket),
    ):
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    # Containers plex (protected), sonarr (pending), radarr, and the flash folder.
    assert _state(hass, mock_config_entry, "protected_items").state == "1"
    assert _state(hass, mock_config_entry, "unprotected_items").state == "3"
