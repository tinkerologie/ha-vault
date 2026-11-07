# Vault in Home Assistant

This integration represents Vault backup protection and recovery in Home Assistant. Shared backup terms retain their Vault meaning; connection, identity and dashboard terms describe their Home Assistant representation.

## Connections and identity

**Vault Connection**:
A saved Home Assistant connection to one Vault server. Multiple connections can coexist.
_Avoid_: job, storage destination

**Server Device**:
The Home Assistant device grouping a Vault Connection’s server, Job and Destination entities.
_Avoid_: per-job device, per-storage device

**Job Identifier**:
The stable identity of a Job within a Vault Connection, independent of its editable name.
_Avoid_: job name, entity ID

**Entity ID**:
The user-editable Home Assistant address of an entity representing Vault state or an action.
_Avoid_: job identifier

## Backup domain

**Job**:
A saved Vault backup policy selecting items, a Destination, a schedule and options.
_Avoid_: run, task

**Job Item**:
A source selection saved in a Job.
_Avoid_: job run

**Destination**:
A configured Vault storage location for backup data.
_Avoid_: server device, replication source

**Job Run**:
A recorded execution associated with a Job, distinguished as backup or restore.
_Avoid_: backup run when either kind is meant

**Backup Run**:
An execution that attempts to protect a Job’s selected data.
_Avoid_: restore run

**Restore Run**:
A recorded execution that attempts to recover backed-up data.
_Avoid_: backup run

**Restore Point**:
A recorded recovery point for backed-up data, which may exist even when a Backup Run was partial.
_Avoid_: successful run

**Partial Backup**:
An outcome in which some requested data was not protected; it is not a successful complete backup.
_Avoid_: success, complete backup

## State and events

**Current Run**:
The currently tracked backup or restore execution.
_Avoid_: latest backup

**Latest Backup**:
The most recent Backup Run in the available history, excluding Restore Runs.
_Avoid_: latest run

**Last Finished Backup**:
The most recent completed Backup Run in the available history, regardless of its outcome.
_Avoid_: last successful backup

**Protected Item**:
A discovered item represented in at least one retained Restore Point.
_Avoid_: configured item

**Pending Item**:
An item selected by a Job that has not yet been backed up.
_Avoid_: protected item

**Unprotected Item**:
A discovered item that is not protected, including a Pending Item; an unknown discovery result is not a zero count.
_Avoid_: unselected item

**Anomaly**:
A Vault condition requiring operational attention, such as missing protection or unusual backup behavior.
_Avoid_: Home Assistant repair

**Storage Health**:
Vault’s reported condition of a Destination, distinct from overall server connectivity.
_Avoid_: server availability

**Backup Event**:
An occurrence describing a Backup Run; failed and partial completion both represent an unsuccessful complete backup.
_Avoid_: restore event

**Restore Event**:
An occurrence describing a Restore Run, distinct from backup completion.
_Avoid_: backup success

## Dashboard

**Entity Map**:
The mapping from Vault roles and object identities to their current Home Assistant Entity IDs.
_Avoid_: entity-name convention

**Summary Card**:
A Vault dashboard view of server, Job or Destination state using entities belonging to the selected Vault Connection.
_Avoid_: Vault server UI
