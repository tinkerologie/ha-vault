# Architectural and design decisions

Current, source-checked decisions live in the [ADR index](../adr/README.md). Domain terms live in the [glossary](../../GLOSSARY.md).

## Historical template notes

The previous decision log was dated **2025-11-29 (Template initialization)**. It described coordinator-based fetching, a separate transport client, platform-specific directories and static entity descriptions. That date belongs to the template notes, not to the retrospective Vault ADRs.

Coordinator-based reconciliation, separate transport clients and entity descriptions remain in the implementation. The template's platform-directory layout does not describe this integration: platforms use flat files. Its polling-only future consideration is superseded by the existing live event connection described in [ADR 0001](../adr/0001-polling-with-push-assisted-refresh.md).

The template's generic future ideas are not accepted Vault architecture decisions. Consult the [current overview](ARCHITECTURE.md) and owning source before proposing changes.
