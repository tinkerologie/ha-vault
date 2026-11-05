#!/bin/bash
# shellcheck disable=SC2034  # sourced by script/test, script/setup/bootstrap and CI

# The Home Assistant release the tests run on, locally and in CI. script/test,
# script/setup/bootstrap and .github/workflows/ci.yml all read it from here, and
# script/hassfest pins the same Core release.
TEST_HOME_ASSISTANT_VERSION="2026.11.0"

# Print the pip requirement for the pytest-homeassistant release that matches
# Home Assistant $1. The plugin must match Home Assistant exactly.
#
# Home Assistant publishes pytest-homeassistant to PyPI, but not for every
# release: 2026.11.0 has no wheel there (PyPI stops at 2026.11.0b6). Every Core
# tag ships the plugin in packages/pytest-homeassistant, so fall back to the tag
# archive when PyPI has no matching version. Never install an unpinned
# pytest-homeassistant: the PyPI project also has unrelated 0.1.x releases.
pytest_homeassistant_requirement() {
    local version="$1"
    if curl -fsS -o /dev/null --retry 3 --max-time 30 \
        "https://pypi.org/pypi/pytest-homeassistant/${version}/json" 2>/dev/null; then
        echo "pytest-homeassistant==${version}"
    else
        echo "pytest-homeassistant @ https://github.com/home-assistant/core/archive/refs/tags/${version}.tar.gz#subdirectory=packages/pytest-homeassistant"
    fi
}
