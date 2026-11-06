# Claude Code Instructions

Repository-wide coding instructions live in [`AGENTS.md`](AGENTS.md).
Engineering skill configuration is in the Agent skills section below.

Read `AGENTS.md` completely before starting any work. It contains:

- Project overview and integration identifiers
- Package structure and architectural rules
- Code style, validation commands, and quality expectations
- Home Assistant patterns (config flow, coordinator, entities, services)
- Error recovery strategy and breaking change policy
- Workflow rules (scope management, translations, documentation)

## Quick Reference

- **Domain:** `vault`
- **Title:** Vault
- **Class prefix:** `Vault`
- **Main code:** `custom_components/vault/`
- **Validate:** `script/check` (type-check + lint + spell)
- **Test:** `script/test`
- **Run HA:** `./script/develop`

## Path-Specific Instructions

Additional domain-specific guidance is available in `.github/instructions/*.instructions.md`.
These files use `applyTo` globs to indicate which files they cover.
Consult the relevant instruction file when working on specific file types:

- `python.instructions.md` — Python style, async patterns, HA imports
- `entities.instructions.md` — Entity platform patterns, inheritance
- `config_flow.instructions.md` — Config flow, reauth, discovery
- `coordinator.instructions.md` — DataUpdateCoordinator patterns
- `api.instructions.md` — API client, exception hierarchy
- `services_yaml.instructions.md` — Service action definitions
- `translations.instructions.md` — Translation file structure

## Agent skills

### Issue tracker

GitHub Issues on `tinkerologie/ha-vault`. Read `docs/agents/issue-tracker.md`
before issue or specification operations.

### Triage labels

Use the default canonical labels. Read `docs/agents/triage-labels.md`
before triaging issues.

### Domain docs

Single-context layout. Read `docs/agents/domain.md` before exploring
domain concepts or architectural decisions.
