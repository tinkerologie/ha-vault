---
status: accepted
---

# Resolve card entities through the entity registry

Vault cards resolve server, Job and Destination roles through the integration’s registry-backed Entity Map rather than guessing entity IDs from names. The map preserves user renames and separates card configuration from naming and localization conventions, while requiring a maintained integration-to-card contract.

Sources: [custom_components/vault/websocket_api.py](../../custom_components/vault/websocket_api.py), [frontend/src/model.ts](../../frontend/src/model.ts).
