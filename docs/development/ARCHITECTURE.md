# Architecture overview

The integration connects Home Assistant to one or more Vault servers. Read the [glossary](../../GLOSSARY.md) for domain meanings and [ADRs](../adr/README.md) for existing architectural trade-offs.

## Runtime flow

```text
Vault Connection
  -> REST client -> coordinator polling snapshot -> entities
  -> live event client -> runtime progress + requested refresh
Home Assistant entity registry -> Entity Map -> Vault cards
```

[Integration setup](../../custom_components/vault/__init__.py) registers actions. It creates the clients and coordinator with Home Assistant's HTTP session. It requests the first data update and stores runtime state in `entry.runtime_data`. It connects the event listener and loads the sensor, binary sensor, button, and event platforms. On unload, it disconnects the event client after it unloads the platforms.

## State and transport ownership

The [REST client](../../custom_components/vault/api/client.py) sends authenticated HTTP requests and handles transport errors. The [models](../../custom_components/vault/api/models.py) give the structure of the Vault API data.

The [coordinator](../../custom_components/vault/coordinator.py) collects server, storage, job, history, restore point, and coverage data. It limits the number of job requests at the same time. It polls more frequently during an active backup or restore.

The [live event client](../../custom_components/vault/api/websocket.py) reconnects and dispatches events. Setup listeners update runtime progress, translate backup and restore events separately, and request debounced polling refreshes for state changes. Polling also corrects the snapshot after missed events.

[Run selection](../../custom_components/vault/runs.py) distinguishes Backup Runs from Restore Runs in mixed history. Backup sensors must not count restores as backup success or treat partial backups as complete protection. Vault gives a limited set of history records. The integration calculates the latest backup values from these records.

## Entities, actions and cards

[Base entities](../../custom_components/vault/entity.py) share a server device per connection. Entity unique IDs use stable keys for roles and objects in each entry. The displayed names and entity IDs can change. Platform properties read coordinator/runtime state. The client sends requests for backups, restores, and destination tests. If there are multiple connections, global actions need an explicit configuration entry.

The [Home Assistant WebSocket command](../../custom_components/vault/websocket_api.py) provides `vault/entity_map`. It uses the entity registry to find entity IDs by role. This command uses a separate connection from the Vault event stream.

The [cards](../../frontend/src/) use the entity map to read entity states after a name change. The restore links open the Vault UI. The integration also provides a restore action.

## Maintainer navigation

- [Config flow](../../custom_components/vault/config_flow.py): connection uniqueness, reauthentication and reconfiguration.
- [Diagnostics](../../custom_components/vault/diagnostics.py): diagnostic collection and redaction.
- [Services](../../custom_components/vault/services.yaml): supported actions and their inputs.
- [HACS metadata](../../hacs.json) and [manifest](../../custom_components/vault/manifest.json): compatibility and dependencies.
- [Agent instructions](../../AGENTS.md): development scripts and contribution workflow.

The frontend build puts the card files in `custom_components/vault/frontend/`. To change card behavior, edit the TypeScript source. Build the frontend again after a card change.
