---
status: accepted
---

# Reconcile polling state with live events

Each Vault Connection uses a shared typed polling snapshot for entity state, supplemented by a reconnecting event stream for progress and refresh requests. Polling remains the reconciliation path when events are missed, while the separate transport clients keep request/authentication handling out of entity properties; this trades duplicate reconciliation work for eventual correction after disconnects.

Sources: [custom_components/vault/coordinator.py](../../custom_components/vault/coordinator.py), [custom_components/vault/**init**.py](../../custom_components/vault/__init__.py), [custom_components/vault/api/websocket.py](../../custom_components/vault/api/websocket.py).
