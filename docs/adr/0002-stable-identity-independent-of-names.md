---
status: accepted
---

# Keep object identity independent of display names

An entity's unique ID uses the configuration entry, the entity role, and the stable job or destination ID. A job name change does not replace its entities. The server device uses the configured host and port. An endpoint change keeps the entity IDs but can change the associated device.

Sources: [custom_components/vault/entity.py](../../custom_components/vault/entity.py), [custom_components/vault/config_flow.py](../../custom_components/vault/config_flow.py).
