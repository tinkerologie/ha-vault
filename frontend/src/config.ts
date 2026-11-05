export const HEALTH_CARD_TAG = "vault-health-card";
export const PROTECTED_CARD_TAG = "vault-protected-card";
export const NEXT_RUN_CARD_TAG = "vault-next-run-card";
export const LAST_BACKUP_CARD_TAG = "vault-last-backup-card";
export const PROGRESS_CARD_TAG = "vault-progress-card";
export const JOBS_CARD_TAG = "vault-jobs-card";
export const ACTIVITY_CARD_TAG = "vault-activity-card";
export const STORAGE_CARD_TAG = "vault-storage-card";
export const ANOMALIES_CARD_TAG = "vault-anomalies-card";
export const RULES_CARD_TAG = "vault-rules-card";
export const DASHBOARD_CARD_TAG = "vault-dashboard-card";

export const DOCUMENTATION_URL =
  "https://github.com/tinkerologie/ha-vault/blob/main/docs/user/CONFIGURATION.md#dashboard-cards";

export interface CardConfig {
  type: string;
  /** Device ID of the Vault server. Older configs may hold a device name. */
  server?: string;
  title?: string;
  /** Set by the summary card for cards it embeds. */
  embedded?: boolean;
  /** Anomalies card: how many anomalies to list before "+N more". */
  max_items?: number;
  [key: string]: unknown;
}

/** Home Assistant's sections-view sizing for a card. */
export interface GridOptions {
  columns?: number | "full";
  rows?: number | "auto";
  min_columns?: number;
  min_rows?: number;
}
