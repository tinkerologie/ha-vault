# Work with GitHub Copilot Coding Agent

Use the [contribution procedure](../../CONTRIBUTING.md) for work from Copilot Coding Agent.
Give Copilot the GitHub issue, the required behavior, and the checks for the change.
If the change uses the Vault API, include the relevant endpoints and example data.
Remove credentials and personal data from the examples.

## Test a Copilot pull request

1. Open the pull request branch in [GitHub Codespaces](CODESPACES.md#use-a-pull-request-branch).
2. Use `./script/develop` to start Home Assistant.
3. Open the forwarded address for port 8123.
4. [Connect the integration to a Vault server](../user/GETTING_STARTED.md#connect-to-vault).
5. Make sure that Home Assistant shows the Vault device and its entities.
6. Do a test of the behavior in the issue.
7. Read `config/home-assistant.log` for errors.

Use the [local validation commands](../../CONTRIBUTING.md#validation-commands) before you mark the pull request ready for review.
If the change needs more work, give Copilot the test result and the expected behavior.

## References

- [GitHub Copilot Coding Agent guidance](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Repository agent instructions](../../AGENTS.md)
- [Repository Copilot instructions](../../.github/copilot-instructions.md)
