# Architecture overview

The integration connects Home Assistant to one or more Vault servers. Read the [glossary](../../GLOSSARY.md) for domain meanings and [ADRs](../adr/README.md) for existing architectural trade-offs.

## Runtime flow

```text
Vault Connection
  -> REST client -> coordinator polling snapshot -> entities
  -> live event client -> runtime progress + requested refresh
Home Assistant entity registry -> Entity Map -> Vault cards
```

[Integration setup](../../custom_components/vault/__init__.py) registers actions, creates the clients and coordinator using Home Assistant's shared HTTP session, performs the first refresh and stores typed runtime state in `entry.runtime_data`. It connects the live event listener and forwards the sensor, binary sensor, button and event platforms. Unload disconnects the event client after platform unloading succeeds.

## State and transport ownership

The [REST client](../../custom_components/vault/api/client.py) owns authenticated requests and transport errors; [models](../../custom_components/vault/api/models.py) describe upstream payloads. The [coordinator](../../custom_components/vault/coordinator.py) aggregates server, storage, Job, history, Restore Point and coverage data, bounds per-Job request concurrency and adjusts polling while work is active.

The [live event client](../../custom_components/vault/api/websocket.py) reconnects and dispatches events. Setup listeners update runtime progress, translate backup and restore events separately, and request debounced polling refreshes for state changes. The polling snapshot and live progress are complementary; live events do not replace reconciliation.

[Run selection](../../custom_components/vault/runs.py) distinguishes Backup Runs from Restore Runs in mixed history. Backup sensors must not count restores as backup success or treat partial backups as complete protection. Available history is bounded, so derived latest/last-success values describe the history fetched, not a complete archive.

## Entities, actions and cards

[Base entities](../../custom_components/vault/entity.py) share a server device per connection. Entity unique IDs use entry-scoped stable role/object keys; user-facing names and Entity IDs can change. Platform properties read coordinator/runtime state. User actions use the client to request backup, restore or Destination testing; with multiple connections, global actions require an explicit configuration entry selection.

The [Home Assistant WebSocket command](../../custom_components/vault/websocket_api.py) provides `vault/entity_map`, resolving roles through the entity registry. This is separate from the daemon event connection. [Card source](../../frontend/src/) consumes that map and entity state, allowing user renames without inferring identities from names; card restore links open Vault's UI, while the integration also exposes a restore action.

## Maintainer navigation

- [Config flow](../../custom_components/vault/config_flow.py): connection uniqueness, reauthentication and reconfiguration.
- [Diagnostics](../../custom_components/vault/diagnostics.py): diagnostic collection and redaction.
- [Services](../../custom_components/vault/services.yaml): supported actions and their inputs.
- [HACS metadata](../../hacs.json) and [manifest](../../custom_components/vault/manifest.json): compatibility and dependencies.
- [Agent instructions](../../AGENTS.md): development scripts and contribution workflow.

Generated card assets live under `custom_components/vault/frontend/`; edit TypeScript source and use the frontend build when changing behavior. Documentation-only changes do not require rebuilding those assets.
