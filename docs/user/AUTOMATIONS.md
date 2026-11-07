# Vault Automations

Home Assistant can start a backup, restore an item, or do a storage destination test.
See the [action parameters](../../README.md#custom-services) before you write an automation.

If you have more than one Vault integration entry, use the [configuration entry ID](#select-a-vault-server).

## Start a backup at a specified time

This automation starts a Vault job at 02:00 each day.

1. Replace `Daily Backup` with the name of your Vault backup job.
2. If necessary, change the time in `at`.

```yaml
alias: Daily Vault Backup
triggers:
  - trigger: time
    at: "02:00:00"
actions:
  - action: vault.run_backup
    data:
      job_name: Daily Backup
```

You can use `job_id` in place of `job_name`. Use the numeric ID of the job.

## Select a Vault server

1. Find the entity ID of the **Online** sensor for the Vault server.
2. Open **Developer tools** → **Template**.
3. Replace `binary_sensor.example_vault_online` with that entity ID in this template.

   ```jinja
   {{ config_entry_id('binary_sensor.example_vault_online') }}
   ```

4. Copy the result to `config_entry_id` in the action data.

For example:

```yaml
actions:
  - action: vault.run_backup
    data:
      job_name: Daily Backup
      config_entry_id: "01JABCDEF1234567890XYZ"
```

## Start a backup when a Home Assistant update is available

This automation requests a backup when the Home Assistant Core update entity changes from `off` to `on`.
If the job settings let Vault stop containers or virtual machines, the backup can stop them.

1. Replace `update.home_assistant_core_update` with your update entity ID.
2. Replace `1` with the ID of the Vault job that backs up Home Assistant.

```yaml
alias: Start Vault Backup When an Update Is Available
triggers:
  - trigger: state
    entity_id: update.home_assistant_core_update
    from: "off"
    to: "on"
actions:
  - action: vault.run_backup
    data:
      job_id: 1
```

The `vault.run_backup` action gives control back to Home Assistant before Vault completes the backup.
If the update entity is already `on`, use the job's **Run backup** button.

Before you install the update:

1. Open **History** in Vault.
2. Find the backup that started after Home Assistant started the automation.
3. Make sure that the backup has status **Completed**.
4. In **Restore**, make sure that the new restore point contains Home Assistant.

## Show a notification when a backup fails

This automation shows a notification when Vault gives a `vault_backup_failed` event for a failed or partial backup.

Replace `1` with the ID of the Vault backup job. If you have more than one Vault server, add `entry_id` to `event_data`. Use the configuration entry ID for that server.

```yaml
alias: Vault Backup Failure
triggers:
  - trigger: event
    event_type: vault_backup_failed
    event_data:
      job_id: 1
actions:
  - action: persistent_notification.create
    data:
      title: Vault backup failed
      message: Open Vault and examine the job history.
```

## Test a storage destination

This automation does a storage destination test at 03:00 on Saturdays.
Replace `1` with the ID of your storage destination.

```yaml
alias: Test Vault Storage
triggers:
  - trigger: time
    at: "03:00:00"
conditions:
  - condition: time
    weekday:
      - sat
actions:
  - action: vault.test_storage
    data:
      storage_id: 1
```

If the test fails, read the error under **Settings** → **System** → **Logs**.

## Add an automation

1. Open **Settings** → **Automations & Scenes**.
2. Click **Create Automation**.
3. Select **Create new automation**.
4. Open the automation menu.
5. Select **Edit in YAML**.
6. Paste the YAML for one automation.
7. Save the automation.

Use the entity IDs from your own Home Assistant installation. Find them under **Settings** → **Devices & Services** → **Entities**.
