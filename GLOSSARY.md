# Vault in Home Assistant

The integration shows Vault backup and restore data in Home Assistant. This glossary gives the terms for this data and for the integration.

## Connections and identity

**Vault Connection**:
A Home Assistant configuration entry for one Vault server. Home Assistant can have more than one Vault Connection.
*Avoid*: job, storage destination

**Server Device**:
The Home Assistant device for the server, Job, and Destination entities of one Vault Connection.
*Avoid*: per-job device, per-storage device

**Job Identifier**:
The stable ID of a Job in a Vault Connection. A change to the Job name does not change this ID.
*Avoid*: job name, entity ID

**Entity ID**:
The Home Assistant identifier of an entity that shows a Vault state or starts a Vault action. You can change this identifier.
*Avoid*: job identifier

## Backup domain

**Job**:
A Vault configuration for backup. It specifies the items, the Destination, the schedule, and the backup settings.
*Avoid*: run, task

**Job Item**:
An item that the Job configuration includes.
*Avoid*: job run

**Destination**:
A Vault storage location for backup data.
*Avoid*: server device, replication source

**Job Run**:
A backup or restore operation in a Job's history.
*Avoid*: backup run when either kind is meant

**Backup Run**:
A backup operation for the data that a Job specifies.
*Avoid*: restore run

**Restore Run**:
A restore operation for data in a Restore Point.
*Avoid*: backup run

**Restore Point**:
A record of the data that you can restore from a Backup Run. A Partial Backup can have a Restore Point.
*Avoid*: successful run

**Partial Backup**:
A Backup Run that gives the status `partial`. The run did not protect all the data that the Job specifies.
*Avoid*: success, complete backup

## State and events

**Current Run**:
An active backup or restore.
*Avoid*: latest backup

**Latest Backup**:
The most recent Backup Run in the history that Vault gives.
*Avoid*: latest run

**Last Finished Backup**:
The most recent Backup Run that has ended in the history that Vault gives.
*Avoid*: last successful backup

**Protected Item**:
An item that Vault finds in at least one Restore Point.
*Avoid*: configured item

**Pending Item**:
An item in a Job that Vault has not backed up to a Restore Point.
*Avoid*: protected item

**Unprotected Item**:
An item that Vault finds without a Restore Point. This includes a Pending Item. If Vault cannot count these items, the count is unknown.
*Avoid*: unselected item

**Anomaly**:
A Vault alert for a condition such as missing backup data or an unusual backup result.
*Avoid*: Home Assistant repair

**Storage Health**:
The condition of a Destination that Vault gives.
*Avoid*: server availability

**Backup Event**:
A Home Assistant event for a Backup Run. A run with status `failed` or `partial` gives a `vault_backup_failed` event.
*Avoid*: restore event

**Restore Event**:
A Home Assistant event for a Restore Run.
*Avoid*: backup success

## Dashboard

**Entity Map**:
The data that connects Vault roles and object IDs to their Home Assistant Entity IDs.
*Avoid*: entity-name convention

**Summary Card**:
A Vault dashboard card for the server, a Job, or a Destination. It reads the entities for the selected Vault Connection.
*Avoid*: Vault server UI
