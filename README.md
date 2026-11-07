# Vault Backup Integration for Home Assistant

<!-- BADGES:START -->

[![Marketplace and HACS](https://img.shields.io/badge/Marketplace%20%7C%20HACS-Default-orange.svg)](https://www.hacs.xyz/docs/marketplace/)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/tinkerologie/ha-vault)](https://github.com/tinkerologie/ha-vault/commits/main)
[![GitHub Release](https://img.shields.io/github/v/release/tinkerologie/ha-vault)](https://github.com/tinkerologie/ha-vault/releases)
[![codecov](https://codecov.io/gh/tinkerologie/ha-vault/graph/badge.svg)](https://codecov.io/gh/tinkerologie/ha-vault)
[![License](https://img.shields.io/github/license/tinkerologie/ha-vault)](./LICENSE)

<!-- BADGES:END -->

Use GitHub Codespaces to develop the integration in your browser.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tinkerologie/ha-vault?quickstart=1)

## Features

- Add the integration in the Home Assistant UI.
- See the status and progress of backup jobs.
- Start backup jobs with buttons or actions.
- Restore a backup item with an action.
- Do a test of a storage destination and see its health status.
- See which containers, VMs, and folders have a restore point.
- See the time of the next scheduled backup.
- Use the [Vault dashboard cards](docs/user/CONFIGURATION.md#dashboard-cards).

The integration uses WebSocket events for progress updates.

| Platform        | Description                                         |
| --------------- | --------------------------------------------------- |
| `sensor`        | Server, storage, and backup job data                |
| `binary_sensor` | Connection, job activity, and backup success states |
| `button`        | One button for each backup job                      |
| `event`         | Backup, restore, and missing-item events            |

## Quick Start

### Prerequisites

- A Vault server that Home Assistant can connect to.
- The Vault host name or IP address and the API port (default `24085`).
- A Vault API key if Vault uses API key authentication.
- Home Assistant 2026.6.0 or later.
- HACS 2.0.5 or later if you install with HACS.

### Step 1: Install the Integration

Click the HACS button to open the My Home Assistant page.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tinkerologie&repository=ha-vault&category=integration)

1. Click the button on the My Home Assistant page to open the Vault repository in HACS.
2. Click **Download**.
3. Restart Home Assistant.

<details>
<summary>**Manual Installation (Advanced)**</summary>

1. Download `vault.zip` from the [latest release](https://github.com/tinkerologie/ha-vault/releases/latest).
2. Extract it to `custom_components/vault/` in your Home Assistant configuration directory.
3. Make sure that `manifest.json` is directly in the `vault` directory.
4. Restart Home Assistant.

The release includes `vault.zip`, `SHA256SUMS`, and a signed build attestation. The Marketplace and HACS install the same ZIP. The download count is for the ZIP in the latest release.

To do a check of the ZIP, use these commands in the directory with `vault.zip` and `SHA256SUMS`.

```bash
gh attestation verify vault.zip -R tinkerologie/ha-vault
sha256sum -c SHA256SUMS
```

On macOS, use `shasum -a 256 -c SHA256SUMS`.

</details>

### Step 2: Add and Configure the Integration

Before you add the integration, complete Step 1.

#### Option 1: One-Click Setup (Quick)

Click the My Home Assistant button to open the configuration dialog.

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=vault)

1. Enter the Vault host name or IP address in **Host**.
2. Enter the API port in **Port**. The default is `24085`.
3. If the Vault endpoint uses HTTPS, enable **Use TLS (HTTPS)**.
4. Click **Submit**.
5. If Home Assistant shows **Authentication Required**, enter the key in **API Key**.
6. If you entered a key, click **Submit** again.

#### Option 2: Manual Configuration

1. Open **Settings** → **Devices & Services**.
2. Click **Add Integration**.
3. Select **Vault**.
4. Use the same connection settings as in Option 1.

### Step 3: Do a Connection Check

1. Open the Vault entry under **Settings** → **Devices & Services**.
2. Open the Vault device.
3. Make sure that the **Online** binary sensor shows **Connected**.

The Vault device also shows entities for its backup jobs and storage destinations.
See [Getting Started](docs/user/GETTING_STARTED.md) for installation and connection troubleshooting.

## Available Entities

### Global Sensors

These sensors give information about the Vault server.

- **Status** shows the Vault service health status.
  - Vault can give `ok`, `healthy`, `running`, or error states.
- **Version** is the Vault server version.
- **Total jobs** is the number of backup jobs. Home Assistant disables this diagnostic sensor by default.
- **Enabled jobs** is the number of enabled backup jobs. Home Assistant disables this diagnostic sensor by default.
- **Encryption status** is `enabled` or `disabled`. Home Assistant disables this diagnostic sensor by default.
- **Next backup** gives the start time of the next scheduled backup. The `job_name` attribute gives the job name.
  - Vault gives schedule times in the Unraid time zone without an offset. Home Assistant reads those times in its own time zone. Set both systems to the same time zone.
- **Protected items** gives the number of containers, VMs, and folders with at least one restore point. This is the same count as in the Vault dashboard.
- **Unprotected items** gives the number of items without a restore point. This includes items outside a backup job.
  - The `pending_items` attribute gives the number of items in a job that wait for their first backup. The `items` attribute shows a maximum of 50 names.
  - If Vault cannot get the list of containers or VMs, the sensor is unavailable.
- **Destinations in use** gives the number of storage destinations with a backup from an enabled job. Use this sensor for the 3-2-1 rule.
  - The attributes are `media_types`, `remote_destinations`, and `destinations`. Vault counts each network destination as remote.
- **Runner active job** gives the active job name, or `idle` if there is no active job. If the job name is unknown, the sensor shows the ID. The `run_type` attribute is `backup` or `restore`.

### Per-Job Sensors

The integration adds these sensors for each backup job. Each entity name starts with the job name.

- **Status** gives the status of the most recent backup. It shows `restoring` during an active restore.
  - The states are `idle`, `running`, `restoring`, `completed`, `partial`, `failed`, `skipped`, and `cancelled`.
  - The attributes are `enabled` and `schedule`.
- **Next run** gives the time of the next scheduled backup. The time is unknown if the job is disabled or has no schedule.
- **Last run** gives the end time of the most recent finished backup.
- **Last duration** gives the duration of that backup. Use the `duration_seconds` attribute to get the duration in seconds.
- **Last size** gives the size of that backup.
- **Items backed up** gives the number of items that backup protected.
- **Items failed** gives the number of items that had an error during that backup.
- **Restore points** gives the number of restore points for the job.
- **Last failure reason** gives the failure reason from the most recent finished backup, or `No failures`.
- **Progress** gives the percentage complete for an active backup or restore.

### Global Binary Sensors

- **Online** is `on` when Vault gives a health status of `ok`, `healthy`, or `running`. The device class is Connectivity.
  - If Home Assistant cannot get data from Vault, the sensor is unavailable.

### Per-Job Binary Sensors

The integration adds these binary sensors for each backup job.

- **Running** is `on` during an active backup or restore. The `run_type` attribute is `backup` or `restore`. The device class is Running.
- **Last run successful** is `on` when the most recent finished backup has status `completed`. A restore does not change this state.
- **Problem** is `on` when Vault has an open anomaly for the job.

### Per-Job Buttons

Use the **Run backup** button to start a backup for the job. Home Assistant uses WebSocket events to update the progress.

### Per-Storage Sensors

The integration adds these sensors for each storage destination. Each entity name starts with `Storage` and the destination name.

- **Name** gives the destination name.
- **Type** gives the destination type (for example, local, SMB, or S3).
- **Health** gives the health status.
- **Free space**, **Used space**, and **Total space** give the capacity data.

## Custom Services

Use these actions in Home Assistant automations.

### `vault.run_backup`

Start a Vault backup job by its ID or name.

**Parameters:**

- `job_id` (optional): The numeric ID of the backup job to run
- `job_name` (optional): The name of the backup job to run
- `config_entry_id` (optional): Target Vault config entry ID (required only when multiple Vault instances are configured)

Use one of `job_id` and `job_name`.

**Example using job ID:**

```yaml
action: vault.run_backup
data:
  job_id: 1
```

**Example using job name:**

```yaml
action: vault.run_backup
data:
  job_name: "My Important Backups"
```

**Example targeting a specific Vault config entry:**

```yaml
action: vault.run_backup
data:
  job_id: 1
  config_entry_id: "01JABCDEF1234567890XYZ"
```

### `vault.restore`

Restore a container, VM, or folder from a Vault restore point.

**Parameters:**

- `job_id` (required) is the ID of the job that made the restore point.
- `restore_point_id` (required): The ID of the restore point to restore from
- `item_name` (required): Name of the item to restore (container name, VM name, or folder)
- `item_type` (required): Type of item - `container`, `vm`, or `folder`
- `passphrase` (optional): Encryption passphrase if the backup was encrypted
- `destination` (optional) is the path to use in place of the default path.
- `config_entry_id` (optional): Target Vault config entry ID (required only when multiple Vault instances are configured)

**Example restoring a container:**

```yaml
action: vault.restore
data:
  job_id: 1
  restore_point_id: 42
  item_name: "my-container"
  item_type: "container"
```

**Example restoring an encrypted backup:**

```yaml
action: vault.restore
data:
  job_id: 1
  restore_point_id: 42
  item_name: "my-vm"
  item_type: "vm"
  passphrase: "my-secure-passphrase"
  destination: "/mnt/restored-vms/"
```

### `vault.test_storage`

Do a connection test for a Vault storage destination.

**Parameters:**

- `storage_id` (required): The ID of the storage destination to test
- `config_entry_id` (optional): Target Vault config entry ID (required only when multiple Vault instances are configured)

**Example:**

```yaml
action: vault.test_storage
data:
  storage_id: 1
```

If the test fails, Home Assistant logs the error.

## Automation Examples

### Automated Nightly Backups

This automation starts a backup at 02:00 each day.

```yaml
automation:
  - alias: "Run Nightly Vault Backups"
    trigger:
      - platform: time
        at: "02:00:00"
    action:
      - action: vault.run_backup
        data:
          job_name: "Nightly Full Backup"
```

### Backup Before System Updates

See [Start a backup when a Home Assistant update is available](docs/user/AUTOMATIONS.md#start-a-backup-when-a-home-assistant-update-is-available).
Before you install the update, make sure that the backup has status `completed`.

### Alert on Backup Failure

See [Show a notification when a backup fails](docs/user/AUTOMATIONS.md#show-a-notification-when-a-backup-fails).

### Monitor Backup Progress

This automation shows a notification with the progress at the start of a backup. Replace the two example entity IDs with the IDs for your job.

```yaml
automation:
  - alias: "Backup Progress Notification"
    trigger:
      - platform: state
        entity_id: binary_sensor.my_backup_job_running
        from: "off"
        to: "on"
    condition:
      - condition: state
        entity_id: binary_sensor.my_backup_job_running
        attribute: run_type
        state: backup
    action:
      - action: persistent_notification.create
        data:
          title: "Backup Running"
          message: "Backup job started. Current progress: {{ states('sensor.my_backup_job_progress') }}%"
```

## Configuration Options

See the [configuration reference](docs/user/CONFIGURATION.md) for the connection procedure and dashboard cards.

### During Setup

| Name                | Required | Description                                             | Default |
| ------------------- | -------- | ------------------------------------------------------- | ------- |
| Host                | Yes      | Hostname or IP address of your Vault server             | -       |
| Port                | No       | Port number for Vault API                               | 24085   |
| API Key             | No       | Authentication key (if required by your Vault instance) | -       |
| **Use TLS (HTTPS)** | No       | Use HTTPS for the connection                            | Off     |

### After Setup (Options)

You can change the connection settings after setup.

See [Change the connection settings](docs/user/CONFIGURATION.md#change-the-connection-settings).

## Troubleshooting

### Connection Issues

#### Check Vault Service

If **Online** shows **Disconnected** or **Unavailable**, see [Find connection errors](docs/user/GETTING_STARTED.md#find-connection-errors).

#### Enable TLS

If the Vault connection uses HTTPS, enable **Use TLS (HTTPS)** in [the connection settings](docs/user/CONFIGURATION.md#change-the-connection-settings).

### Enable Debug Logging

To enable debug logging for Vault, add these lines to `configuration.yaml`.

```yaml
logger:
  default: info
  logs:
    custom_components.vault: debug
```

Restart Home Assistant. Read the logs under **Settings** → **System** → **Logs** or in `config/home-assistant.log`.

### Common Issues

#### "Cannot Connect" Error

If Home Assistant shows **Unable to connect to Vault**, see [Find connection errors](docs/user/GETTING_STARTED.md#find-connection-errors).

To do a connection test from the Home Assistant host, use `curl http://YOUR_HOST:24085/api/v1/health`. If Vault uses TLS, replace `http` with `https`.

#### "API Error" Messages

If Home Assistant shows an API error, do these steps.

1. If Vault uses API key authentication, make sure that the key is correct.
2. Read the Vault server logs for error messages.
3. Make sure that the Vault version is compatible.
4. [Download diagnostic data](docs/user/CONFIGURATION.md#diagnostic-data).

#### No Entities Appearing

If Home Assistant does not show the entities:

1. Make sure that **Online** shows **Connected**.
2. Make sure that Vault has backup jobs.
3. Wait for the next data update.
4. Open the Vault entry under **Settings** → **Devices & Services**.
5. Select **Reload** from the entry menu.
6. Read the logs for errors.

#### WebSocket Connection Issues

If Home Assistant does not receive live updates:

1. Make sure that firewalls and proxies let WebSocket connections go to the Vault API host and port.
2. Read the Home Assistant logs for WebSocket errors.

## Contributing

See [Contributing](CONTRIBUTING.md) for the issue and pull request procedures.

### Development Setup

#### Cloud Development (Recommended)

Use GitHub Codespaces to develop the integration in your browser.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tinkerologie/ha-vault?quickstart=1)

The Codespace has Home Assistant and the development tools.

#### Local Development

Install these tools for local development:

- Docker Desktop
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

1. Clone this repository.
2. Open the repository in VS Code.
3. Click **Reopen in Container**.

## License

See [LICENSE](LICENSE) for the Apache License 2.0. See [NOTICE](NOTICE) for the MIT license for previous releases.
