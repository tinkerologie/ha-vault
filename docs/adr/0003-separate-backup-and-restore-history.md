---
status: accepted
---

# Keep backup outcomes distinct from restore activity

Vault history contains both backups and restores, so backup outcome, size and success calculations select Backup Runs while current activity may track either kind. This prevents a successful restore from presenting as a successful backup and keeps partial backup completion distinct from full success, at the cost of explicit run-kind handling throughout presentation and events.

Sources: [custom_components/vault/runs.py](../../custom_components/vault/runs.py), [custom_components/vault/**init**.py](../../custom_components/vault/__init__.py).
