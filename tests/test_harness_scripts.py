"""The test harness scripts: which pytest-homeassistant to install, and when script/test reinstalls.

The scripts run from a temporary copy of ``script/`` with stub ``curl``,
``uv``, ``python`` and ``pytest`` executables first on ``PATH``, so nothing is
downloaded or installed. Each stub appends its arguments to a log.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import os
from pathlib import Path
import re
import shutil
import subprocess

import pytest

REPO = Path(__file__).resolve().parents[1]
PINNED_VERSION = re.search(
    r'^TEST_HOME_ASSISTANT_VERSION="([^"]+)"$',
    (REPO / "script/.lib/ha-test-harness.sh").read_text(),
    re.MULTILINE,
)[1]  # type: ignore[index]
ARCHIVE_REQUIREMENT = (
    "pytest-homeassistant @ https://github.com/home-assistant/core/archive/refs/tags/"
    "{version}.tar.gz#subdirectory=packages/pytest-homeassistant"
)

# Each stub logs "<name> <args...>" and behaves according to environment variables.
STUBS = {
    "curl": """#!/bin/bash
echo "curl $*" >> "$STUB_LOG"
exit "${FAKE_CURL_STATUS:-0}"
""",
    "uv": """#!/bin/bash
echo "uv $*" >> "$STUB_LOG"
""",
    "python": """#!/bin/bash
echo "python $*" >> "$STUB_LOG"
case "$*" in
  *"homeassistant.const"*)
    [[ -n "${FAKE_HA_VERSION:-}" ]] || exit 1
    echo "$FAKE_HA_VERSION" ;;
  *"import pytest_homeassistant"*)
    exit "${FAKE_PLUGIN_STATUS:-0}" ;;
  *"import pytest"*)
    exit 0 ;;
esac
""",
    "pytest": """#!/bin/bash
echo "pytest $*" >> "$STUB_LOG"
""",
}


@dataclass
class HarnessProject:
    """A temporary copy of the scripts with stubbed tools."""

    root: Path
    log: Path
    env: dict[str, str] = field(default_factory=dict)

    def run(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["bash", *args],
            cwd=self.root,
            env=self.env,
            capture_output=True,
            text=True,
            check=False,
            timeout=60,
        )

    def calls(self, tool: str) -> list[str]:
        if not self.log.exists():
            return []
        return [
            line.removeprefix(f"{tool} ") for line in self.log.read_text().splitlines() if line.startswith(f"{tool} ")
        ]


@pytest.fixture
def project(tmp_path: Path) -> HarnessProject:
    root = tmp_path / "project with spaces"
    shutil.copytree(REPO / "script", root / "script")
    # script/test cleans up through script/clean; keep the copy from touching anything.
    (root / "script/clean").write_text("#!/bin/bash\nexit 0\n")
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    for name, body in STUBS.items():
        stub = bin_dir / name
        stub.write_text(body)
        stub.chmod(0o755)
    log = tmp_path / "calls.log"
    env = {
        "PATH": f"{bin_dir}{os.pathsep}/usr/bin{os.pathsep}/bin",
        "HOME": str(tmp_path),
        "STUB_LOG": str(log),
        # script/test only activates a virtual environment when none is active.
        "VIRTUAL_ENV": str(tmp_path / "venv"),
    }
    return HarnessProject(root=root, log=log, env=env)


def requirement_for(project: HarnessProject, version: str) -> subprocess.CompletedProcess[str]:
    return project.run(
        "-c",
        'source script/.lib/ha-test-harness.sh && pytest_homeassistant_requirement "$1"',
        "harness",
        version,
    )


def test_harness_pins_the_plugin_from_pypi_when_released(project: HarnessProject) -> None:
    """A version PyPI has is installed from PyPI, pinned exactly."""
    result = requirement_for(project, "2026.11.1")
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == "pytest-homeassistant==2026.11.1"
    (curl,) = project.calls("curl")
    assert "https://pypi.org/pypi/pytest-homeassistant/2026.11.1/json" in curl


def test_harness_falls_back_to_the_core_tag_archive(project: HarnessProject) -> None:
    """Without a PyPI release, the plugin comes from the matching Core tag, never unpinned."""
    project.env["FAKE_CURL_STATUS"] = "22"
    result = requirement_for(project, "2026.11.0")
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == ARCHIVE_REQUIREMENT.format(version="2026.11.0")


def test_script_test_keeps_a_matching_environment(project: HarnessProject) -> None:
    """With the pinned Home Assistant and the plugin installed, script/test installs nothing."""
    project.env["FAKE_HA_VERSION"] = PINNED_VERSION
    result = project.run("script/test", "--cov", "-k", "sensor")
    assert result.returncode == 0, result.stdout + result.stderr
    assert project.calls("uv") == []
    (pytest_call,) = project.calls("pytest")
    assert pytest_call.split() == ["--cov=custom_components/vault", "--cov-report=term-missing", "-k", "sensor"]


@pytest.mark.parametrize(
    ("installed", "plugin_status", "curl_status", "plugin"),
    [
        ("2026.10.2", "0", "0", f"pytest-homeassistant=={PINNED_VERSION}"),
        (PINNED_VERSION, "1", "22", ARCHIVE_REQUIREMENT.format(version=PINNED_VERSION)),
        ("", "1", "22", ARCHIVE_REQUIREMENT.format(version=PINNED_VERSION)),
    ],
    ids=["other-home-assistant", "plugin-missing", "nothing-installed"],
)
def test_script_test_installs_the_pinned_pair(
    project: HarnessProject, installed: str, plugin_status: str, curl_status: str, plugin: str
) -> None:
    """A different Home Assistant or a missing plugin installs the pinned release and its plugin."""
    if installed:
        project.env["FAKE_HA_VERSION"] = installed
    project.env["FAKE_PLUGIN_STATUS"] = plugin_status
    project.env["FAKE_CURL_STATUS"] = curl_status
    result = project.run("script/test")
    assert result.returncode == 0, result.stdout + result.stderr
    uninstall, install = project.calls("uv")
    # The retired plugin and the plugin's old name share files with pytest-homeassistant.
    assert uninstall == "pip uninstall pytest-homeassistant-custom-component pytest-home-assistant"
    assert install.startswith("pip install --reinstall-package pytest-homeassistant ")
    assert f"homeassistant=={PINNED_VERSION}" in install
    assert install.endswith(plugin)
    assert len(project.calls("pytest")) == 1
