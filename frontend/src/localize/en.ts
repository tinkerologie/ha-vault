/**
 * English card strings. Other languages add a file with the same keys and
 * register it in `localize.ts`; missing keys fall back to English.
 *
 * Plural forms use Intl.PluralRules categories: `key.one`, `key.other`, ...
 * Placeholders are written `{name}`.
 */
export const en = {
  // Card names in the picker
  "card.health.name": "Vault health",
  "card.health.description": "Overall status of a Vault server and what needs attention.",
  "card.protected.name": "Vault protected items",
  "card.protected.description": "How many containers, VMs and folders are in a backup.",
  "card.next_run.name": "Vault next run",
  "card.next_run.description": "When the next scheduled backup starts.",
  "card.last_backup.name": "Vault last backup",
  "card.last_backup.description": "Outcome, size and duration of the latest backup.",
  "card.progress.name": "Vault backup in progress",
  "card.progress.description": "Progress of running backups and restores.",
  "card.jobs.name": "Vault backup jobs",
  "card.jobs.description": "Backup jobs with their status, schedule and a Run backup action.",
  "card.activity.name": "Vault recent activity",
  "card.activity.description": "Each job's latest run, newest first.",
  "card.storage.name": "Vault storage",
  "card.storage.description": "Storage destinations with health and capacity.",
  "card.anomalies.name": "Vault anomalies",
  "card.anomalies.description": "Open anomalies Vault detected in your backups.",
  "card.rules.name": "Vault 3-2-1 rule",
  "card.rules.description": "Checks the 3-2-1 rule against the destinations your jobs back up to.",
  "card.dashboard.name": "Vault summary",
  "card.dashboard.description": "One status, what needs attention, the last and next backup.",

  // Titles
  "title.health": "Vault health",
  "title.protected": "Protected",
  "title.next_run": "Next run",
  "title.last_backup": "Last backup",
  "title.progress": "Backup in progress",
  "title.restore_progress": "Restore in progress",
  "title.jobs": "Backup jobs",
  "title.activity": "Recent activity",
  "title.storage": "Storage destinations",
  "title.anomalies": "Anomalies",
  "title.rules": "3-2-1 backup rule",

  // Editor
  "editor.server": "Vault server",
  "editor.server_helper": "Leave empty to use the first Vault server.",
  "editor.title": "Title",
  "editor.max_items": "Anomalies to show",

  // States
  "level.failed": "Failed",
  "level.warning": "Needs attention",
  "level.unknown": "Unknown",
  "level.running": "Running",
  "level.disabled": "Disabled",
  "level.ok": "Healthy",
  "level.idle": "Never run",
  "server.ok": "Healthy",
  "server.running": "Backing up",
  "server.restoring": "Restoring",
  "server.warning": "Needs attention",
  "server.failed": "Problem",
  "server.unknown": "Status unknown",
  "server.offline": "Offline",
  "job.ok": "Completed",
  "job.disabled": "Disabled",
  "job.enabled_unknown": "Schedule unknown",

  // Common
  "common.unavailable": "Unavailable",
  "common.not_set_up": "No Vault server found. Add the Vault integration to use this card.",
  "common.load_error": "Couldn't load Vault entities: {error}",
  "common.loading": "Loading…",
  "common.open_in_vault": "Open in Vault",
  "common.open_in_vault_job": "Open {job} in Vault",
  "common.version": "Version {version}",
  "common.separator": " · ",
  "common.more.one": "+{count} more",
  "common.more.other": "+{count} more",
  "common.items.one": "{count} item",
  "common.items.other": "{count} items",
  "common.jobs.one": "{count} job",
  "common.jobs.other": "{count} jobs",
  "common.destinations.one": "{count} destination",
  "common.destinations.other": "{count} destinations",
  "common.dismiss": "Dismiss",

  // Attention reasons
  "attention.offline": "Vault is offline",
  "attention.unreachable": "Vault data is unavailable",
  "attention.daemon": "Vault reports {state}",
  "attention.job_failed": "{subject} failed",
  "attention.job_warning": "{subject} needs attention",
  "attention.job_unknown": "{subject} status is unknown",
  "attention.anomalies.one": "{count} open anomaly",
  "attention.anomalies.other": "{count} open anomalies",
  "attention.storage": "{subject} storage needs attention",
  "attention.unprotected.one": "{count} item isn't backed up",
  "attention.unprotected.other": "{count} items aren't backed up",
  "attention.none": "Nothing needs attention",

  // Protected
  "protected.of_total": "of {total}",
  "protected.all": "All items are backed up",
  "protected.unprotected.one": "{count} item isn't backed up",
  "protected.unprotected.other": "{count} items aren't backed up",
  "protected.pending.one": "{count} waiting for its first backup",
  "protected.pending.other": "{count} waiting for their first backup",
  "protected.total_unknown": "Items no job covers can't be counted",
  "protected.unknown": "Coverage unknown",
  "protected.meter": "Protected items",

  // Next run
  "next_run.running": "Running now",
  "next_run.restoring": "Restore running now",
  "next_run.none": "No backup scheduled",
  "next_run.unknown": "Next run unknown",
  "next_run.job": "{job}",
  "next_run.jobs_enabled": "{jobs}, {enabled} enabled",

  // Last backup
  "last_backup.none": "No backups yet",

  // Progress
  "progress.idle": "No backup or restore running",
  "progress.backing_up": "Backing up",
  "progress.restoring": "Restoring",
  "progress.next": "Next: {time}",
  "progress.label": "Backup progress of {job}",
  "progress.restore_label": "Restore progress of {job}",
  "progress.queue.one": "{count} job queued",
  "progress.queue.other": "{count} jobs queued",

  // Jobs
  "jobs.empty": "No backup jobs on this Vault server",
  "jobs.last_run": "Last run {time}",
  "jobs.never_run": "Never run",
  "jobs.next_run": "Next {time}",
  "jobs.not_scheduled": "Not scheduled",
  "jobs.run": "Run backup",
  "jobs.run_label": "Run {job} now",
  "jobs.starting": "Starting…",
  "jobs.started": "Started",
  "jobs.confirm_title": "Run {job} now?",
  "jobs.confirm_text": "This starts a backup of {job} outside its schedule. Depending on the job's settings, Vault may stop containers or VMs while it backs them up.",
  "jobs.confirm_ok": "Run backup",
  "jobs.confirm_cancel": "Cancel",
  "jobs.run_failed": "Couldn't start {job}: {error}",
  "jobs.restore_points.one": "{count} restore point",
  "jobs.restore_points.other": "{count} restore points",

  // Activity
  "activity.empty": "No backups have run yet",

  // Storage
  "storage.empty": "No storage destinations",
  "storage.free": "{free} free",
  "storage.used": "{percent} used",
  "storage.capacity_unknown": "Capacity not reported",
  "storage.usage": "Space used on {name}",
  "storage.health_ok": "Healthy",
  "storage.health_unknown": "Health unknown",
  "storage.type.local": "Local",
  "storage.type.smb": "SMB",
  "storage.type.nfs": "NFS",
  "storage.type.s3": "S3",
  "storage.type.sftp": "SFTP",
  "storage.type.webdav": "WebDAV",

  // Anomalies
  "anomalies.none": "No open anomalies",
  "anomalies.scope": "Job: {job}",
  "anomalies.system": "Whole server",
  "anomalies.severity.critical": "Critical",
  "anomalies.severity.warning": "Warning",
  "anomalies.severity.info": "Info",

  // 3-2-1
  "rules.met": "Met",
  "rules.likely_met": "Likely met",
  "rules.not_met": "Not met",
  "rules.unknown": "Unknown",
  "rules.copies": "3 copies",
  "rules.copies_detail.one": "{count} destination backed up to",
  "rules.copies_detail.other": "{count} destinations backed up to",
  "rules.media": "2 media",
  "rules.media_detail.one": "{count} media type",
  "rules.media_detail.other": "{count} media types",
  "rules.offsite": "1 offsite",
  "rules.offsite_detail_yes": "Remote destination",
  "rules.offsite_detail_no": "Local only",
  "rules.footnote": "Counts destinations that enabled jobs have backed up to, not copies of each item. Vault doesn't know where a destination is, so any network destination counts as remote, even an SMB or NFS share on the same site.",
} as const;

export type TranslationKey = keyof typeof en;
