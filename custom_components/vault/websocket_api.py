"""Websocket API for the Vault dashboard cards.

The cards need to know which entities belong to which Vault server, job and
storage destination. Entity IDs and friendly names can be renamed by users, so
the cards ask the integration instead of parsing them.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import DOMAIN

if TYPE_CHECKING:
    from .coordinator import VaultConfigEntry

WS_TYPE_ENTITY_MAP = f"{DOMAIN}/entity_map"

_JOB_KEY = re.compile(r"^job_(\d+)_")
_STORAGE_KEY = re.compile(r"^storage_(\d+)_")


@callback
def async_setup_websocket_api(hass: HomeAssistant) -> None:
    """Register the websocket commands used by the dashboard cards."""
    websocket_api.async_register_command(hass, websocket_entity_map)


def _entry_entity_map(hass: HomeAssistant, entry: VaultConfigEntry) -> dict[str, Any]:
    """Group a config entry's enabled entities by server, job and storage destination.

    Entities are keyed by their translation key, which is unique per role.
    """
    entity_registry = er.async_get(hass)
    device_registry = dr.async_get(hass)
    data = entry.runtime_data.coordinator.data
    prefix = f"{entry.entry_id}_"

    server: dict[str, str] = {}
    jobs: dict[int, dict[str, str]] = {}
    storage: dict[int, dict[str, str]] = {}
    for reg_entry in er.async_entries_for_config_entry(entity_registry, entry.entry_id):
        if reg_entry.disabled_by is not None or not reg_entry.unique_id.startswith(prefix):
            continue
        key = reg_entry.unique_id.removeprefix(prefix)
        role = reg_entry.translation_key or key
        if match := _JOB_KEY.match(key):
            jobs.setdefault(int(match[1]), {})[role] = reg_entry.entity_id
        elif match := _STORAGE_KEY.match(key):
            storage.setdefault(int(match[1]), {})[role] = reg_entry.entity_id
        else:
            server[role] = reg_entry.entity_id

    devices = dr.async_entries_for_config_entry(device_registry, entry.entry_id)
    device = devices[0] if devices else None

    job_names = {job.id: job.name for job in data.jobs} if data else {}
    storage_by_id = {dest.id: dest for dest in data.storage} if data else {}

    return {
        "entry_id": entry.entry_id,
        "title": entry.title,
        "device_id": device.id if device else None,
        "configuration_url": device.configuration_url if device else None,
        "entities": server,
        "jobs": sorted(
            (
                {"job_id": job_id, "name": job_names.get(job_id, str(job_id)), "entities": entities}
                for job_id, entities in jobs.items()
                if job_id in job_names
            ),
            key=lambda job: str(job["name"]).casefold(),
        ),
        "storage": sorted(
            (
                {"storage_id": storage_id, "name": storage_by_id[storage_id].name, "entities": entities}
                for storage_id, entities in storage.items()
                if storage_id in storage_by_id
            ),
            key=lambda dest: str(dest["name"]).casefold(),
        ),
    }


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_ENTITY_MAP})
@callback
def websocket_entity_map(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the entities of every loaded Vault server, grouped for the cards."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    connection.send_result(msg["id"], {"entries": [_entry_entity_map(hass, entry) for entry in entries]})
