---
applyTo: "tests/**/*.py"
---

# Test Instructions

**Applies to:** `tests/` directory

**Official documentation:** [Home Assistant Testing](https://developers.home-assistant.io/docs/development_testing)

## Test Structure

**Mirror integration structure:**

```text
tests/
  conftest.py          # Shared fixtures
  test_init.py         # Integration setup
  test_config_flow.py  # Config flow
  sensor/test_air_quality.py
  binary_sensor/test_connectivity.py
```

**File organization:**

- One test file per module/feature
- Named `test_*.py`
- Use fixtures from `conftest.py`

## Pytest Markers

**Categorize tests:**

- `@pytest.mark.unit` - Fast, isolated (no external dependencies)
- `@pytest.mark.integration` - With coordinator, time service, etc.

## Fixtures

**Standard fixtures (define in `conftest.py`):**

- `hass` - Mock Home Assistant instance
- `config_entry` - `MockConfigEntry` from `pytest_homeassistant.common` (Home Assistant's `pytest-homeassistant` plugin)
- `coordinator` - VaultDataUpdateCoordinator
- `mock_api_client` - Mocked API client

**Define fixtures in `conftest.py`:** Use `MockConfigEntry` from `pytest_homeassistant.common` (Home Assistant's `pytest-homeassistant` plugin)

**Use [Syrupy](https://github.com/tophat/syrupy) for large outputs:**

- Snapshots for: Entity states, registry entries, diagnostics, config flow results
- Update: `script/test --snapshot-update`, commit `.ambr` files
- Complement functional tests, don't replace them
- Pattern: `assert hass.states.get("sensor.x") == snapshot`

## Core Interface Testing

**Rule: Test through core interfaces (`hass.states`, `hass.services`), not integration internals.**

✅ **Correct:** `hass.states.get("sensor.x")`, `await hass.services.async_call(DOMAIN, "action")`

❌ **Wrong:** Direct entity instantiation, accessing entity properties directly

## Registry Testing

**Registry Testing:**

- Device: `dr.async_get(hass).async_get_device(identifiers={(DOMAIN, id)})` - Verify manufacturer, model, identifiers
- Entity: `er.async_get(hass).async_get("sensor.x")` - Verify unique_id, disabled state
- Lifecycle: Test `async_setup()` → `LOADED`, `async_unload()` → `NOT_LOADED`

## Mocking

**Mocking:**

✅ **Mock:** External APIs, network calls, time-dependent operations
- Use `patch.object()` for success cases, `side_effect` for errors
- Pattern: `with patch.object(client, "method", return_value=data):`

❌ **Don't mock:** Home Assistant internals, your own integration code

## Entity Testing

**Entity Testing:**

Pattern: Setup entry → `async_block_till_done()` → `hass.states.get("entity_id")` → assert state/attributes

## Config Flow Testing

**Config Flow Testing:**

Pattern: `hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"}, data={...})`

Verify: `result["type"]` (form/create_entry/abort), `result["step_id"]`, `result["errors"]`

## Test Commands

```bash
script/test                    # All tests
script/test -v                 # Verbose
script/test --cov-html         # Coverage report (htmlcov/index.html)
script/test tests/sensor/      # Specific directory
script/test -k test_sensor     # Pattern matching
script/test -m unit            # Marker filtering
script/test --snapshot-update  # Update snapshots
```

## Rules

**Do:**

- Test success and error cases
- Mock external dependencies (API, network, time)
- Use descriptive test names and docstrings
- Keep tests focused (one assertion concept per test)
- Use fixtures for setup
- Test through core interfaces (`hass.states`, `hass.services`)
- Use snapshots for large outputs (don't replace functional tests)
- Verify registry entries and config entry lifecycle
- Use `async_fire_time_changed` instead of `time.sleep()`

**Don't:**

- Make real network requests
- Test Home Assistant internals
- Access entity objects directly
- Create complex test scenarios
- Skip error condition testing
- Assume patterns - research when uncertain

## Test Harness

- Tests run on Home Assistant's own `pytest-homeassistant` plugin (module `pytest_homeassistant`), which replaced `pytest-homeassistant-custom-component`. The plugin must match the installed Home Assistant exactly.
- The Home Assistant release the tests run on is `TEST_HOME_ASSISTANT_VERSION` in `script/.lib/ha-test-harness.sh`; `script/setup/bootstrap`, `script/test` and `.github/workflows/ci.yml` read it there, and `script/hassfest` pins the same Core release. `pytest_homeassistant_requirement` installs the plugin from PyPI when it has that release and otherwise from the Core tag archive (PyPI has no `pytest-homeassistant` 2026.11.0).
- `pyproject.toml` passes `-p no:respx`: respx's plugin imports `httpx` before Home Assistant aliases it, and the plugin then fails to load.

## Deprecations and Upcoming Home Assistant Releases

- **Current release (blocking):** the normal test run fails on deprecated use by the integration.
  - `pyproject.toml` `filterwarnings` turns `DeprecationWarning` and `PendingDeprecationWarning` attributed to `custom_components.vault` modules into errors. Third-party deprecations keep the default action.
  - Home Assistant logs, rather than warns, when an integration uses a deprecated API (`homeassistant.helpers.frame.report_usage`, `DeprecatedConstant`, `deprecated_class`, `deprecated_function`) or when an entity class still defines a deprecated attribute (`custom_components.vault.<module>::<Class> provides the deprecated <name>`). `tests/fixtures/deprecations.py` collects those log lines when they name `vault`, and the autouse `fail_on_ha_deprecation_reports` fixture fails the test that logged one. `tests/__init__.py` installs the handler early, so reports logged during import surface on the first test. The `pytest-homeassistant` harness has no built-in check for this.
  - Fix the reported call in production code; do not silence the check. A test that triggers a report on purpose must drain it with `DEPRECATION_REPORTS.pop_reports()`.
- **Next release (early warning, non-blocking):** `.github/workflows/ha-next.yml` runs weekly, on demand, and on PRs that touch `pyproject.toml`, `requirements*.txt`, `manifest.json`, `script/import_smoke.py`, `script/hassfest` or `script/.lib/ha-test-harness.sh`, on two channels:
  - `release`: the newest Home Assistant on PyPI, beta included. It installs Home Assistant and the matching `pytest-homeassistant` (PyPI, or the Core tag when PyPI lacks it), and runs `python script/import_smoke.py`, the test suite, and `HA_VERSION=<version> ./script/hassfest --skip-plugins ""`.
  - `dev`: the head of Core's `dev` branch, pinned to one commit, weeks before the next beta. It downloads that commit, generates Core's English translation files (`python -m script.translations develop --all`; the source tree has none), installs Home Assistant and `pytest-homeassistant` from it, and runs the import smoke test, the test suite, and Hassfest.
  - Scheduled and manual runs on `main` keep one issue per channel, labelled `ha-next` and `bug` so CodeRabbit plans the fix.
- **Developer blog (early warning, non-blocking):** `.github/workflows/ha-dev-blog.yml` runs weekly and on demand (input `days`, default 22, so a run catches up after two missed weeks). `script/ha_dev_blog.py` reads the developer blog feed, keeps posts from the last `days` that announce a deprecation, removal or breaking change, and searches `custom_components/vault/` for the code identifiers those sentences name. It opens one issue per such post that names something the integration uses, titled `HA dev blog: <post title>` and labelled `ha-dev-blog` and `enhancement`, and never opens a second issue for the same post (it matches the post link in existing issue bodies, open or closed). A post page that cannot be read is listed in the job summary and fails the run, after issues open for the posts that were read. Run it locally with `python3 script/ha_dev_blog.py --days 30`.
- **When ha-next fails:** open the run linked from the `ha-next` issue and read the job summary.
  - Import smoke or test failure: the release removed or deprecated an API the integration uses. Reproduce it with `uv pip install "homeassistant==<version>"` and the matching plugin in a scratch venv (for the dev channel, `"homeassistant @ https://github.com/home-assistant/core/archive/<commit>.tar.gz"`) and `python script/import_smoke.py`, then fix it with an import or API that also works on the minimum supported Home Assistant (`homeassistant` in `hacs.json`).
  - Install failure: the release needs a newer Python or conflicts with a pinned dependency, or `pytest-homeassistant` for that release is not published yet.
  - Hassfest failure: run the same command locally; a new validator rule or a changed Core layout may need a `script/hassfest` change.
  - The next passing scheduled or manual run on `main` closes the issue.

## Research Resources

**When uncertain about testing patterns:**

- [Home Assistant Testing Docs](https://developers.home-assistant.io/docs/development_testing) - HA-specific patterns
- [pytest Documentation](https://docs.pytest.org/) - Fixtures, markers, advanced usage
- [Home Assistant Core Tests](https://github.com/home-assistant/core/tree/dev/tests/components) - Integration examples
- Google: `site:developers.home-assistant.io testing [topic]`

**Coverage targets:**

- Coordinator logic, config flow validation, error handling, entity state calculations
- Check: `script/test --cov-html`
