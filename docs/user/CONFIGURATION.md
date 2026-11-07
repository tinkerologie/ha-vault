# Configuration Reference

## Connection settings

Home Assistant shows the connection settings when you [add Vault](GETTING_STARTED.md#connect-to-vault).

| Setting             | Default | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| **Host**            | None    | The host name or IP address of the Unraid server.        |
| **Port**            | `24085` | The port of the Vault API.                               |
| **Use TLS (HTTPS)** | Off     | If the Vault connection uses HTTPS, enable this setting. |
| **API Key**         | None    | If Vault uses API key authentication, enter the key.     |

### Change the connection settings

1. Open **Settings** → **Devices & Services**.
2. Open the menu on the Vault integration entry.
3. Select **Reconfigure**.
4. Change the connection settings.
5. Click **Submit**.

### Add more than one Vault server

Add a Vault integration entry for each server. Home Assistant gives each server its own device and entities.
If you use a Vault action with multiple entries, [select the Vault server](AUTOMATIONS.md#select-a-vault-server) with `config_entry_id`.

## Entity settings

1. Open **Settings** → **Devices & Services** → **Entities**.
2. Select the entity.
3. Open the entity settings.

You can change the entity name, entity ID, or icon in these settings. You can also disable the entity.

## Data updates

The integration requests data from Vault every 60 seconds. During an active backup or restore, the interval changes to 10 seconds.
The integration also uses WebSocket events to start data updates.

## Dashboard cards

Home Assistant registers the Vault cards when the integration loads.

1. Open **Edit dashboard** → **Add card**.
2. Search for "Vault".
3. Select a card. The card picker shows a preview.

The card editor has these settings.

- **Vault server** selects the Vault device. Leave this field empty to use the first server. You can also use the device name in YAML.
- **Title** changes the default title.

| Card                            | Shows                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `custom:vault-dashboard-card`   | Server status, problems, open anomalies, and current activity. It shows the last and next backup. It uses the full width of a section.             |
| `custom:vault-health-card`      | Server status and its causes. A failed job changes the status. Unavailable data shows as unknown.                                                  |
| `custom:vault-protected-card`   | Items with a restore point compared with all containers, VMs, and folders that Vault finds. This includes items outside a backup job.              |
| `custom:vault-next-run-card`    | The next scheduled backup or the current backup or restore.                                                                                        |
| `custom:vault-last-backup-card` | The result, size, and duration of the latest backup.                                                                                               |
| `custom:vault-progress-card`    | Progress of current backups and restores. The card shows the type of each operation.                                                               |
| `custom:vault-jobs-card`        | The status, last run, and next run for each job, with a **Run backup** action.                                                                     |
| `custom:vault-activity-card`    | The latest backup for each job, from newest to oldest.                                                                                             |
| `custom:vault-storage-card`     | Storage destinations, health, and capacity.                                                                                                        |
| `custom:vault-anomalies-card`   | Open anomalies. Use `max_items` to set the list limit (default 5).                                                                                 |
| `custom:vault-rules-card`       | An estimate of the 3-2-1 rule for destinations that enabled jobs use. The card can show "Likely met". Vault counts network destinations as remote. |

When you select **Run backup**, the card shows a confirmation dialog. If the job settings let Vault stop containers or VMs, the backup can stop them. The card shows an error if the job does not start.

**Open in Vault** opens the Vault UI in a new tab. Select a job, value, or problem to open the Home Assistant dialog for its entity.

Cards use automatic row height in a sections view (`rows: auto`). They use your theme colors and the Home Assistant language, number, date, and time settings.

```yaml
type: custom:vault-jobs-card
server: 0123456789abcdef0123456789abcdef # optional: a Vault device ID
title: Backups # optional
```

## Diagnostic data

1. Open **Settings** → **Devices & Services**.
2. Open the menu on the Vault integration entry.
3. Select **Download diagnostics**.

The file includes the connection settings, Vault health data, and information about the backup jobs.
The integration removes values for known sensitive fields. Examine the file for sensitive information before you share it.

## Related documentation

- [Getting Started](GETTING_STARTED.md)
- [Automations](AUTOMATIONS.md)
