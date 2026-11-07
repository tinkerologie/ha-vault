# Develop in GitHub Codespaces

## Start a Codespace

1. Open the Vault integration repository on GitHub.
2. Click **Code**.
3. Select **Codespaces**.
4. Click **Create codespace on main**.
5. Wait for the dev container setup to complete.

The dev container installs Python 3.14, Home Assistant, HACS, and VS Code extensions.
See the [dev container settings](../../.devcontainer/devcontainer.json) for the package setup and port settings.

## Start Home Assistant

1. Open a terminal in the Codespace.
2. Use `./script/develop` to start Home Assistant.
3. Open **Ports** in VS Code.
4. Open the forwarded address for port 8123.

For local development, open `http://localhost:8123` after you start Home Assistant.

## Use a pull request branch

1. Open the pull request on GitHub.
2. Open **Code**.
3. Create a Codespace for the pull request branch.
4. [Start Home Assistant](#start-home-assistant).
5. Do a test of the integration with a Vault server.

See [Test a Copilot pull request](COPILOT_AGENT.md#test-a-copilot-pull-request).

## Find Codespace problems

- If Python errors show while setup installs packages, wait for setup to complete.
- If the errors remain, open the VS Code command palette. Select **Developer: Reload Window**.
- If port 8123 is missing, open **Ports**. Select **Forward a Port**. Enter `8123`.
- If the Codespace does not start, make sure that your GitHub account has Codespaces access.

Workspace files remain when you stop the Codespace. Stop the Codespace when you finish work.

## References

- [GitHub Codespaces documentation](https://docs.github.com/en/codespaces)
- [Codespaces billing](https://docs.github.com/en/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces)
