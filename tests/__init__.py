"""Tests for the Vault integration."""

from .fixtures.deprecations import install_deprecation_report_handler  # noqa: TID251 - test-only helpers

# Before conftest imports the integration, so import-time reports are caught too.
install_deprecation_report_handler()
