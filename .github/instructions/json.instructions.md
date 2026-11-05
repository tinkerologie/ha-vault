---
applyTo: "**/*.json"
---

# JSON Instructions

**Applies to:** All JSON files

## Formatting Standards

- **2 spaces** for indentation
- No trailing commas
- No comments (JSON spec doesn't support them)
- Use double quotes for all strings
- End files with a single newline

## Validation

Use Python's json module to validate syntax:

```bash
python3 -m json.tool file.json > /dev/null
```

## Schema Validation

JSON schema files are available in `/schemas/json/`:

- `manifest_schema.json` — Validates `manifest.json`
- `translation_schema.json` — Validates translation files in `translations/`
- `icons_schema.json` — Validates `icons.json`
- `hacs_schema.json` — Validates `hacs.json`

`hacs.json` sets `zip_release: true` and `filename: "vault.zip"`, so HACS and the Home Assistant Marketplace install the release asset that `script/build_release_zip.py` builds in `.github/workflows/release.yml`. Keep both keys and the asset name in sync. HACS reads `hacs.json` at the latest release tag, so a change takes effect with the next release.

Consult the relevant schema when editing JSON files to ensure correct structure.
