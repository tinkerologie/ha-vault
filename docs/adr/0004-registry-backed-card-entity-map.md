---
status: accepted
---

# Resolve card entities through the entity registry

Vault cards use the Entity Map to find entity IDs for server, Job, and Destination roles. The map reads IDs from the Home Assistant entity registry. The cards continue to work after a name or ID change. The integration and the cards must use the same map structure.

Sources: [custom_components/vault/websocket_api.py](../../custom_components/vault/websocket_api.py), [frontend/src/model.ts](../../frontend/src/model.ts).
