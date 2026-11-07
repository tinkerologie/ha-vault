---
status: accepted
---

# Keep object identity independent of display names

Entity unique IDs combine the configuration entry identity with stable role and Job or Destination identifiers, so renaming a Job does not replace its entities. All these entities belong to one server device identified by the configured host and port; endpoint changes therefore retain entry-scoped entity identity but can change device association.

Sources: [custom_components/vault/entity.py](../../custom_components/vault/entity.py), [custom_components/vault/config_flow.py](../../custom_components/vault/config_flow.py).
