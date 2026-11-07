---
status: accepted
---

# Reconcile polling state with live events

Each Vault connection supplies entity state from a shared polling snapshot. The event stream gives progress data. The integration also uses these events to start new data updates. If the event stream disconnects, polling continues to update the state. Separate clients handle requests and authentication outside entity properties.

Sources: [custom_components/vault/coordinator.py](../../custom_components/vault/coordinator.py), [custom_components/vault/**init**.py](../../custom_components/vault/__init__.py), [custom_components/vault/api/websocket.py](../../custom_components/vault/api/websocket.py).
