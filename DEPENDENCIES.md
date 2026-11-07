# Dependencies

## Runtime dependencies

Home Assistant installs the Python packages in the `requirements` field of the [integration manifest](custom_components/vault/manifest.json).
The integration lists `pydantic>=2.0` in this field.

`requirements.txt` is for integration packages that the development environment must install separately.
The file has no package entries at this time.
If you add a runtime package that Home Assistant does not already install, add it to the manifest and to `requirements.txt`.

## Development dependencies

Use `script/setup/bootstrap` to install the development packages.

- `requirements_dev.txt` lists development packages, such as Pyright and Colorlog.
- `requirements_test.txt` is for test packages that are specific to this integration.
- The bootstrap script also installs packages from the Home Assistant Core requirements files.

Home Assistant Core supplies pytest, Ruff, and other development tools.
The bootstrap script and `script/test` install the official `pytest-homeassistant` plugin.
The plugin version must match the Home Assistant version.
See the [test harness settings](script/.lib/ha-test-harness.sh) and the [test setup procedure](CONTRIBUTING.md#prerequisites-and-setup).

## Home Assistant version

The bootstrap script uses the Home Assistant version in the test harness by default.
The [dev container](.devcontainer/devcontainer.json) sets `HA_VERSION` to `latest`.
This value selects the most recent stable release available from PyPI.
To select a different version, set `HA_VERSION` to that version before you start the bootstrap script.

## HACS requirements

[hacs.json](hacs.json) gives the minimum supported Home Assistant and HACS versions.
The integration manifest gives the Python package requirements.
