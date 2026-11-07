# Getting Started with Vault

Use this guide to install Vault in Home Assistant and connect it to your Unraid server.

## Prerequisites

- Home Assistant 2026.6.0 or later.
- A Vault server that Home Assistant can connect to.
- HACS (Home Assistant Community Store) 2.0.5 or later for HACS installation.

## Install with HACS

1. Open the [Vault repository in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=tinkerologie&repository=ha-vault&category=integration).
2. Click **Download**.
3. Restart Home Assistant.

## Install manually

1. Download `vault.zip` from the [latest release](https://github.com/tinkerologie/ha-vault/releases/latest).
2. Extract the files into `custom_components/vault/` in your Home Assistant configuration directory.
3. Make sure that `manifest.json` is directly in the `vault` directory.
4. Restart Home Assistant.

## Connect to Vault

If Home Assistant finds Vault on the network, open the Vault entry under **Settings** → **Devices & Services**.

To add Vault without network discovery, do these steps.

1. Open **Settings** → **Devices & Services**.
2. Click **Add Integration**.
3. Select **Vault**.
4. Enter the host name or IP address of the Unraid server in **Host**.
5. Enter the Vault API port in **Port**. The default is `24085`.
6. If the Vault endpoint uses HTTPS, enable **Use TLS (HTTPS)**.
7. Click **Submit**.

If Home Assistant shows **Authentication Required**, enter the Vault API key. Click **Submit**.

## Make sure that Vault is online

1. Open the Vault entry under **Settings** → **Devices & Services**.
2. Open the Vault device.
3. Make sure that the **Online** binary sensor shows **Connected**.

Home Assistant shows entities for the Vault server, its backup jobs, and its storage destinations.

## Find connection errors

1. Make sure that Vault is running on the Unraid server.
2. Make sure that Home Assistant can connect to the Vault host and port.
3. If Vault uses API key authentication, make sure that the key is correct.
4. Read the Vault messages under **Settings** → **System** → **Logs**.

See [Configuration Reference](CONFIGURATION.md) for connection settings and dashboard cards.
See [Automations](AUTOMATIONS.md) for examples of Home Assistant actions.
