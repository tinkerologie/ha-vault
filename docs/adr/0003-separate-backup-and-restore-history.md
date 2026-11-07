---
status: accepted
---

# Keep backup outcomes distinct from restore activity

Vault history contains backup and restore runs. Backup outcome, size, and success calculations use only backup runs. Current activity can show either type of run. This keeps a successful restore separate from a successful backup. It also keeps partial backup results separate from full success. The UI and event handlers must distinguish run types.

Sources: [custom_components/vault/runs.py](../../custom_components/vault/runs.py), [custom_components/vault/**init**.py](../../custom_components/vault/__init__.py).
