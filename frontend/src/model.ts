/**
 * The Vault data model behind every card.
 *
 * Pure functions only (no Lit, no DOM), so they can be unit tested. The
 * integration's `vault/entity_map` command says which entity plays which role
 * for each server, job and storage destination; this module reads those
 * entities' states and decides what they mean. Unavailable or unknown data is
 * always reported as unknown, never as healthy, covered or running.
 */
import type { HassEntities, HassEntity } from "./ha-types";

export type RoleMap = Record<string, string>;

export interface JobMapEntry {
  job_id: number;
  name: string;
  entities: RoleMap;
}

export interface StorageMapEntry {
  storage_id: number;
  name: string;
  entities: RoleMap;
}

export interface EntryMap {
  entry_id: string;
  title: string;
  device_id: string | null;
  configuration_url: string | null;
  entities: RoleMap;
  jobs: JobMapEntry[];
  storage: StorageMapEntry[];
}

const MISSING = new Set(["unavailable", "unknown", ""]);

/** The entity's state object, or undefined when the entity is missing or has no usable state. */
export function usable(states: HassEntities, entityId: string | undefined): HassEntity | undefined {
  if (!entityId) return undefined;
  const entity = states[entityId];
  return entity && !MISSING.has(entity.state) ? entity : undefined;
}

/** A number from an entity's state; null when missing or not a number. Zero stays zero. */
export function readNumber(states: HassEntities, entityId: string | undefined): number | null {
  const entity = usable(states, entityId);
  if (!entity) return null;
  const value = Number(entity.state);
  return Number.isFinite(value) ? value : null;
}

/** true/false for an on/off entity; null when missing or unavailable. */
export function readBinary(states: HassEntities, entityId: string | undefined): boolean | null {
  const entity = usable(states, entityId);
  if (!entity) return null;
  if (entity.state === "on") return true;
  if (entity.state === "off") return false;
  return null;
}

/** Milliseconds since the epoch from a timestamp entity; null when missing or invalid. */
export function readTime(states: HassEntities, entityId: string | undefined): number | null {
  const entity = usable(states, entityId);
  if (!entity) return null;
  const value = Date.parse(entity.state);
  return Number.isNaN(value) ? null : value;
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

/**
 * How a job, a destination or the whole server is doing, worst first.
 * `idle` means a job that has never run; `disabled` a job that won't run.
 */
export type Level = "failed" | "warning" | "unknown" | "running" | "disabled" | "ok" | "idle";

const LEVEL_ORDER: Level[] = ["failed", "warning", "unknown", "running", "disabled", "ok", "idle"];

export function worstLevel(levels: Level[]): Level {
  let worst: Level = "idle";
  for (const level of levels) {
    if (LEVEL_ORDER.indexOf(level) < LEVEL_ORDER.indexOf(worst)) worst = level;
  }
  return worst;
}

export interface JobSignals {
  /** The job status sensor's state: idle, running, completed, partial, failed, skipped, cancelled. */
  status: string | null;
  running: boolean | null;
  problem: boolean | null;
  lastRunSuccessful: boolean | null;
  itemsFailed: number | null;
  enabled: boolean | null;
}

/**
 * One status for a job, used by every card.
 *
 * - A running job is running, whatever the last run did.
 * - The last run's outcome decides failed or warning: a failed run is failed;
 *   partial, skipped and cancelled runs, failed items, an unsuccessful last
 *   run or an open problem are warnings.
 * - Without a usable status the job is unknown, never ok.
 */
export function jobLevel(job: JobSignals): Level {
  if (job.running === true || job.status === "running" || job.status === "restoring") return "running";
  if (job.status === null) return "unknown";
  if (job.status === "failed") return "failed";
  const warned =
    ["partial", "skipped", "cancelled"].includes(job.status) ||
    (job.itemsFailed ?? 0) > 0 ||
    job.problem === true ||
    (job.status !== "idle" && job.lastRunSuccessful === false);
  if (warned) return "warning";
  if (job.enabled === false) return "disabled";
  if (job.status === "idle") return "idle";
  return "ok";
}

/**
 * How the job's last finished backup went, for run history. While a backup or
 * restore runs, the status sensor describes that run, so fall back to the
 * last-run-successful sensor; a disabled job's runs still count.
 */
export function lastRunOutcome(job: JobSignals): Level {
  const busy = job.status === "running" || job.status === "restoring" || job.running === true;
  if (!busy) return jobLevel({ ...job, enabled: null });
  if (job.lastRunSuccessful === null) return "unknown";
  const status = job.lastRunSuccessful ? "completed" : "partial";
  return jobLevel({ ...job, status, running: false, enabled: null });
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface Job {
  id: number;
  name: string;
  entities: RoleMap;
  status: string | null;
  enabled: boolean | null;
  /** Running a backup or a restore. */
  running: boolean;
  /** The running run is a restore, not a backup. */
  restoring: boolean;
  progress: number | null;
  lastRun: number | null;
  nextRun: number | null;
  itemsDone: number | null;
  itemsFailed: number | null;
  restorePoints: number | null;
  /** The job's status, including whether it's disabled: for job lists. */
  level: Level;
  /** How the last run went, whether or not the job is enabled: for run history. */
  outcome: Level;
}

export function readJob(states: HassEntities, job: JobMapEntry): Job {
  const e = job.entities;
  const statusEntity = usable(states, e.job_status);
  const enabledAttr = states[e.job_status ?? ""]?.attributes?.enabled;
  const signals: JobSignals = {
    status: statusEntity ? statusEntity.state : null,
    running: readBinary(states, e.job_running),
    problem: readBinary(states, e.job_problem),
    lastRunSuccessful: readBinary(states, e.job_last_success),
    itemsFailed: readNumber(states, e.job_items_failed),
    enabled: typeof enabledAttr === "boolean" ? enabledAttr : null,
  };
  const level = jobLevel(signals);
  return {
    id: job.job_id,
    name: job.name,
    entities: e,
    status: signals.status,
    enabled: signals.enabled,
    running: level === "running",
    restoring:
      level === "running" &&
      (signals.status === "restoring" || states[e.job_running ?? ""]?.attributes?.run_type === "restore"),
    progress: readNumber(states, e.job_progress),
    lastRun: readTime(states, e.job_last_run),
    nextRun: readTime(states, e.job_next_run),
    itemsDone: readNumber(states, e.job_items_backed_up),
    itemsFailed: signals.itemsFailed,
    restorePoints: readNumber(states, e.job_restore_points),
    level,
    outcome: lastRunOutcome(signals),
  };
}

/** Jobs that have run, newest first. */
export function recentRuns(jobs: Job[]): Job[] {
  return jobs
    .filter((job) => job.lastRun !== null)
    .sort((a, b) => (b.lastRun ?? 0) - (a.lastRun ?? 0));
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const BYTES_PER_UNIT: Record<string, number> = {
  b: 1,
  kb: 1e3,
  mb: 1e6,
  gb: 1e9,
  tb: 1e12,
  pb: 1e15,
  kib: 2 ** 10,
  mib: 2 ** 20,
  gib: 2 ** 30,
  tib: 2 ** 40,
  pib: 2 ** 50,
};

/** Bytes from a data size entity, using its unit. Null when missing or the unit is unknown. */
export function readBytes(states: HassEntities, entityId: string | undefined): number | null {
  const value = readNumber(states, entityId);
  if (value === null) return null;
  const unit = String(states[entityId ?? ""]?.attributes?.unit_of_measurement ?? "B").toLowerCase();
  const factor = BYTES_PER_UNIT[unit];
  return factor === undefined ? null : value * factor;
}

export interface Destination {
  id: number;
  name: string;
  entities: RoleMap;
  type: string | null;
  /** Health check state; null when unknown. */
  health: string | null;
  /** Used share 0-100, or null when capacity isn't reported. */
  usedPercent: number | null;
  level: Level;
}

export function readDestination(states: HassEntities, dest: StorageMapEntry): Destination {
  const e = dest.entities;
  const health = usable(states, e.storage_health)?.state ?? null;
  const total = readBytes(states, e.storage_total_space);
  let used = readBytes(states, e.storage_used_space);
  const free = readBytes(states, e.storage_free_space);
  if (used === null && total !== null && free !== null) used = total - free;
  const usedPercent =
    total !== null && total > 0 && used !== null ? Math.min(100, Math.max(0, (used / total) * 100)) : null;
  let level: Level = "unknown";
  if (health !== null) level = health.toLowerCase() === "ok" ? "ok" : "warning";
  if (level === "ok" && usedPercent !== null && usedPercent >= 90) level = "warning";
  return {
    id: dest.storage_id,
    name: usable(states, e.storage_name)?.state ?? dest.name,
    entities: e,
    type: usable(states, e.storage_type)?.state ?? null,
    health,
    usedPercent,
    level,
  };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export interface Anomaly {
  summary: string;
  severity: string;
  job: string | null;
  detector: string;
}

export interface Coverage {
  protected: number | null;
  unprotected: number | null;
  pending: number | null;
}

export interface RuleCheck {
  destinations: number | null;
  mediaTypes: number | null;
  remote: number | null;
}

export type AttentionKind =
  | "offline"
  | "unreachable"
  | "daemon"
  | "job_failed"
  | "job_warning"
  | "job_unknown"
  | "anomalies"
  | "storage"
  | "unprotected";

export interface Attention {
  kind: AttentionKind;
  level: Level;
  /** The entity to open for details. */
  entityId?: string;
  /** A job, destination or count the message names. */
  subject?: string;
  count?: number;
}

export interface VaultModel {
  entry: EntryMap;
  /** null when the online entity is missing or unavailable. */
  online: boolean | null;
  daemonStatus: string | null;
  version: string | null;
  activeJob: string | null;
  /** "backup" or "restore" while the runner is busy. */
  activeRunType: string | null;
  anomalies: Anomaly[];
  anomalyCount: number | null;
  nextBackup: { time: number; job: string | null } | null;
  coverage: Coverage;
  rules: RuleCheck;
  jobs: Job[];
  storage: Destination[];
  running: Job[];
  attention: Attention[];
  level: Level;
}

function readAnomalies(entity: HassEntity | undefined): Anomaly[] {
  const raw = entity?.attributes?.anomalies;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      summary: String(item.summary ?? item.detector ?? ""),
      severity: String(item.severity ?? "warning"),
      job: typeof item.job === "string" ? item.job : null,
      detector: String(item.detector ?? ""),
    }));
}

export function buildModel(states: HassEntities, entry: EntryMap): VaultModel {
  const e = entry.entities;
  const online = readBinary(states, e.vault_online);
  const daemonStatus = usable(states, e.vault_status)?.state ?? null;
  const jobs = entry.jobs.map((job) => readJob(states, job));
  const storage = entry.storage.map((dest) => readDestination(states, dest));
  const anomaliesEntity = usable(states, e.open_anomalies);
  const anomalyCount = readNumber(states, e.open_anomalies);
  const activeRaw = usable(states, e.runner_current_job_id)?.state ?? null;
  const nextTime = readTime(states, e.next_backup);
  const nextJob = states[e.next_backup ?? ""]?.attributes?.job_name;
  const destinationsEntity = states[e.destinations_in_use ?? ""];
  const destinationsKnown = usable(states, e.destinations_in_use) !== undefined;
  const unprotectedEntity = usable(states, e.unprotected_items);

  const model: VaultModel = {
    entry,
    online,
    daemonStatus,
    version: usable(states, e.vault_version)?.state ?? null,
    activeJob: activeRaw && activeRaw !== "idle" ? activeRaw : null,
    activeRunType: activeRaw && activeRaw !== "idle" ? runTypeOf(states[e.runner_current_job_id ?? ""]) : null,
    anomalies: readAnomalies(anomaliesEntity),
    anomalyCount,
    nextBackup: nextTime === null ? null : { time: nextTime, job: typeof nextJob === "string" ? nextJob : null },
    coverage: {
      protected: readNumber(states, e.protected_items),
      unprotected: readNumber(states, e.unprotected_items),
      pending: typeof unprotectedEntity?.attributes?.pending_items === "number"
        ? (unprotectedEntity.attributes.pending_items as number)
        : null,
    },
    rules: {
      destinations: readNumber(states, e.destinations_in_use),
      mediaTypes: destinationsKnown ? numberAttr(destinationsEntity, "media_types") : null,
      remote: destinationsKnown ? numberAttr(destinationsEntity, "remote_destinations") : null,
    },
    jobs,
    storage,
    running: jobs.filter((job) => job.running),
    attention: [],
    level: "ok",
  };
  model.attention = attentionFor(model);
  model.level = serverLevel(model);
  return model;
}

function runTypeOf(entity: HassEntity | undefined): string | null {
  const value = entity?.attributes?.run_type;
  return typeof value === "string" ? value : null;
}

/** True when everything running is a restore. */
export function onlyRestoring(model: VaultModel): boolean {
  if (model.running.length > 0) return model.running.every((job) => job.restoring);
  return model.activeRunType === "restore";
}

function numberAttr(entity: HassEntity | undefined, name: string): number | null {
  const value = entity?.attributes?.[name];
  return typeof value === "number" ? value : null;
}

/** Everything that needs a look, worst first. */
export function attentionFor(model: VaultModel): Attention[] {
  const e = model.entry.entities;
  const items: Attention[] = [];
  if (model.online === false) {
    items.push({ kind: "offline", level: "failed", entityId: e.vault_online });
    return items;
  }
  if (model.online === null && model.daemonStatus === null) {
    items.push({ kind: "unreachable", level: "unknown", entityId: e.vault_online ?? e.vault_status });
    return items;
  }
  if (model.daemonStatus !== null && model.daemonStatus.toLowerCase() !== "ok") {
    items.push({ kind: "daemon", level: "failed", entityId: e.vault_status, subject: model.daemonStatus });
  }
  for (const job of model.jobs) {
    if (job.level === "failed") {
      items.push({ kind: "job_failed", level: "failed", entityId: job.entities.job_status, subject: job.name });
    }
  }
  for (const job of model.jobs) {
    if (job.level === "warning") {
      items.push({
        kind: "job_warning",
        level: "warning",
        entityId: job.entities.job_problem ?? job.entities.job_status,
        subject: job.name,
      });
    }
  }
  for (const job of model.jobs) {
    if (job.level === "unknown") {
      items.push({ kind: "job_unknown", level: "unknown", entityId: job.entities.job_status, subject: job.name });
    }
  }
  if ((model.anomalyCount ?? 0) > 0) {
    const critical = model.anomalies.some((a) => a.severity === "critical");
    items.push({
      kind: "anomalies",
      level: critical ? "failed" : "warning",
      entityId: e.open_anomalies,
      count: model.anomalyCount ?? 0,
    });
  }
  for (const dest of model.storage) {
    if (dest.level === "warning") {
      items.push({ kind: "storage", level: "warning", entityId: dest.entities.storage_health, subject: dest.name });
    }
  }
  if ((model.coverage.unprotected ?? 0) > 0) {
    items.push({
      kind: "unprotected",
      level: "warning",
      entityId: e.unprotected_items,
      count: model.coverage.unprotected ?? 0,
    });
  }
  return items;
}

/** The server's overall level: the worst attention item, else running, else ok. */
export function serverLevel(model: VaultModel): Level {
  if (model.attention.length > 0) return worstLevel(model.attention.map((a) => a.level));
  if (model.running.length > 0 || model.activeJob !== null) return "running";
  if (model.online === null) return "unknown";
  return "ok";
}

/** The most recent run across all jobs. */
export function lastBackup(model: VaultModel): Job | null {
  return recentRuns(model.jobs)[0] ?? null;
}

/** Pick the Vault server a card shows: by device id, device or entry name, else the first. */
export function selectEntry(
  entries: EntryMap[],
  server: string | undefined,
  deviceNames: Record<string, string[]> = {}
): EntryMap | undefined {
  if (server) {
    const wanted = server.toLowerCase();
    const match = entries.find(
      (entry) =>
        entry.device_id === server ||
        entry.entry_id === server ||
        entry.title.toLowerCase() === wanted ||
        (entry.device_id !== null &&
          (deviceNames[entry.device_id] ?? []).some((name) => name.toLowerCase() === wanted))
    );
    if (match) return match;
  }
  return entries[0];
}

/** Every entity ID the model reads for an entry, to decide when a card must re-render. */
export function trackedEntityIds(entry: EntryMap): string[] {
  const ids = Object.values(entry.entities);
  for (const job of entry.jobs) ids.push(...Object.values(job.entities));
  for (const dest of entry.storage) ids.push(...Object.values(dest.entities));
  return ids;
}
