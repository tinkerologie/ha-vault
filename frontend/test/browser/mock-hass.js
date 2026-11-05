// A mock Home Assistant `hass` object with Vault entities, for the browser tests.
// Shapes follow the integration: the `vault/entity_map` websocket result, enum
// job status sensors with `enabled`/`schedule` attributes, and so on.

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function entity(entity_id, state, attributes = {}) {
  return { entity_id, state: String(state), attributes, last_changed: "", last_updated: "" };
}

const JOBS = [
  { id: 1, slug: "daily_containers_backup", name: "Daily Containers Backup", enabled: true, status: "completed", lastRunAgo: 2 * HOUR, nextIn: 22 * HOUR, size: 3.49, duration: "3m 41s", items: 12, points: 5 },
  { id: 12, slug: "home_assistant_backup", name: "Home Assistant Backup", enabled: true, status: "completed", lastRunAgo: 1 * HOUR, nextIn: 23 * HOUR, size: 17.79, duration: "4m 2s", items: 1, points: 5 },
  { id: 22, slug: "vms_backup_test", name: "VMs Backup Test", enabled: false, status: "completed", lastRunAgo: 2 * DAY, nextIn: null, size: 56.65, duration: "2m 35s", items: 1, points: 1 },
  { id: 30, slug: "a_job_with_a_much_longer_name", name: "A job with a much longer name than the others", enabled: true, status: "idle", lastRunAgo: null, nextIn: 3 * DAY, size: null, duration: null, items: 0, points: 0 },
];

const STORAGE = [
  { id: 1, slug: "backups", name: "Backups", type: "local", health: "ok", free: 40.1, used: 1.9, total: 42.0, unit: "TB" },
  { id: 2, slug: "offsite_s3", name: "Offsite S3", type: "s3", health: "ok", free: null, used: null, total: null, unit: "GB" },
  { id: 3, slug: "nas_share", name: "NAS share", type: "smb", health: "ok", free: 120, used: 880, total: 1000, unit: "GB" },
];

/** Build states, registries and the entity map for one scenario. */
export function buildScenario(name = "healthy", now = Date.now()) {
  const states = {};
  const entities = {};
  const add = (eid, state, attributes, role, device = "dev1") => {
    states[eid] = entity(eid, state, attributes);
    entities[eid] = { entity_id: eid, device_id: device, platform: "vault", translation_key: role };
    return eid;
  };

  const server = {};
  const s = (role, eid, state, attributes = {}) => (server[role] = add(eid, state, attributes, role));
  s("vault_online", "binary_sensor.vault_backup_online", "on");
  s("vault_status", "sensor.vault_backup_status", "ok");
  s("vault_version", "sensor.vault_backup_version", "2026.10.04");
  s("vault_mode", "sensor.vault_backup_mode", "daemon");
  s("runner_current_job_id", "sensor.vault_backup_runner_active_job", "idle");
  s("runner_queue_length", "sensor.vault_backup_runner_queue_length", "0", { unit_of_measurement: "jobs" });
  s("open_anomalies", "sensor.vault_backup_open_anomalies", "0", { unit_of_measurement: "anomalies" });
  s("next_backup", "sensor.vault_backup_next_backup", new Date(now + 22 * HOUR).toISOString(), { device_class: "timestamp", job_id: 1, job_name: "Daily Containers Backup" });
  s("protected_items", "sensor.vault_backup_protected_items", "19", { unit_of_measurement: "items" });
  s("unprotected_items", "sensor.vault_backup_unprotected_items", "0", { unit_of_measurement: "items", pending_items: 0, items: [] });
  s("destinations_in_use", "sensor.vault_backup_destinations_in_use", "3", { unit_of_measurement: "destinations", media_types: 2, remote_destinations: 2, destinations: ["Backups", "NAS share", "Offsite S3"] });

  const jobs = JOBS.map((job) => {
    const p = `vault_backup_${job.slug}`;
    const roles = {};
    const j = (role, eid, state, attributes = {}) => (roles[role] = add(eid, state, attributes, role));
    j("job_status", `sensor.${p}_status`, job.status, { device_class: "enum", enabled: job.enabled, schedule: "0 3 * * *", options: ["idle", "running", "completed", "partial", "failed", "skipped", "cancelled"] });
    j("job_last_run", `sensor.${p}_last_run`, job.lastRunAgo === null ? "unknown" : new Date(now - job.lastRunAgo).toISOString(), { device_class: "timestamp" });
    j("job_next_run", `sensor.${p}_next_run`, job.nextIn === null ? "unknown" : new Date(now + job.nextIn).toISOString(), { device_class: "timestamp" });
    j("job_last_size", `sensor.${p}_last_size`, job.size ?? "unknown", { unit_of_measurement: "GB", device_class: "data_size" });
    j("job_last_duration", `sensor.${p}_last_duration`, job.duration ?? "unknown");
    j("job_items_backed_up", `sensor.${p}_items_backed_up`, job.items, { unit_of_measurement: "items" });
    j("job_items_failed", `sensor.${p}_items_failed`, 0, { unit_of_measurement: "items" });
    j("job_restore_points", `sensor.${p}_restore_points`, job.points, { unit_of_measurement: "points" });
    j("job_progress", `sensor.${p}_progress`, 0, { unit_of_measurement: "%" });
    j("job_running", `binary_sensor.${p}_running`, "off");
    j("job_last_success", `binary_sensor.${p}_last_run_successful`, job.status === "idle" ? "off" : "on");
    j("job_problem", `binary_sensor.${p}_problem`, "off");
    j("run_backup", `button.${p}_run_now`, "unknown");
    return { job_id: job.id, name: job.name, entities: roles };
  });

  const storage = STORAGE.map((dest) => {
    const p = `vault_backup_storage_${dest.slug}`;
    const roles = {};
    const d = (role, eid, state, attributes = {}) => (roles[role] = add(eid, state, attributes, role));
    d("storage_name", `sensor.${p}_name`, dest.name);
    d("storage_type", `sensor.${p}_type`, dest.type);
    d("storage_health", `sensor.${p}_health`, dest.health);
    for (const [role, key] of [["storage_free_space", "free"], ["storage_used_space", "used"], ["storage_total_space", "total"]]) {
      d(role, `sensor.${p}_${key === "free" ? "free_space" : key === "used" ? "used_space" : "total_space"}`, dest[key] ?? "unknown", { unit_of_measurement: dest.unit, device_class: "data_size" });
    }
    return { storage_id: dest.id, name: dest.name, entities: roles };
  });

  // A second Vault server whose storage must never mix into the first.
  const otherStorage = { storage_id: 9, name: "Other server disk", entities: {
    storage_name: add("sensor.vault_backup_2_storage_disk_name", "Other server disk", {}, "storage_name", "dev2"),
    storage_health: add("sensor.vault_backup_2_storage_disk_health", "ok", {}, "storage_health", "dev2"),
  } };
  const otherServer = { vault_status: add("sensor.vault_backup_2_status", "ok", {}, "vault_status", "dev2") };

  const entryMap = [
    { entry_id: "entry1", title: "Vault (192.168.20.21)", device_id: "dev1", configuration_url: "http://192.168.20.21", entities: server, jobs, storage },
    { entry_id: "entry2", title: "Vault (10.0.0.2)", device_id: "dev2", configuration_url: null, entities: otherServer, jobs: [], storage: [otherStorage] },
  ];

  const set = (eid, state, attributes) => {
    states[eid] = entity(eid, state, { ...(states[eid]?.attributes ?? {}), ...(attributes ?? {}) });
  };
  const daily = jobs[0].entities;

  switch (name) {
    case "failed":
      set(daily.job_status, "failed");
      set(daily.job_problem, "on");
      set(daily.job_last_success, "off");
      set(daily.job_items_failed, "1");
      break;
    case "unavailable":
      for (const eid of Object.keys(states)) set(eid, "unavailable");
      break;
    case "missing_online":
      delete states[server.vault_online];
      break;
    case "running":
      set(daily.job_running, "on");
      set(daily.job_status, "running");
      set(daily.job_progress, "42");
      set(server.runner_current_job_id, "Daily Containers Backup");
      break;
    case "restoring": {
      const job = jobs[2].entities;
      set(job.job_running, "on", { run_type: "restore" });
      set(job.job_status, "restoring");
      set(job.job_progress, "30");
      set(server.runner_current_job_id, "VMs Backup Test", { run_type: "restore", items_done: 0, items_total: 1 });
      break;
    }
    case "attention":
      set(server.open_anomalies, "2", { anomalies: [
        { detector: "size_drift", severity: "critical", summary: "Backup shrank to 0 B", job: "Daily Containers Backup" },
        { detector: "duration", severity: "warning", summary: "Backup took 3x longer", job: null },
      ] });
      set(server.unprotected_items, "3", { pending_items: 1, items: ["container:homeassistant", "container:prowlarr", "folder:Flash Drive"] });
      set(server.destinations_in_use, "1", { media_types: 1, remote_destinations: 0 });
      set(jobs[1].entities.job_problem, "on");
      break;
    default:
      break;
  }

  return { states, entities, entryMap };
}

const TITLE_CASE = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** A mock hass object. `calls` records services and events for assertions. */
export function buildHass(name = "healthy", options = {}) {
  const { states, entities, entryMap } = buildScenario(name, options.now);
  const calls = [];
  const hass = {
    states,
    entities,
    devices: {
      dev1: { id: "dev1", name: "Vault Backup", name_by_user: null, identifiers: [["vault", "192.168.20.21:24085"]], configuration_url: "http://192.168.20.21" },
      dev2: { id: "dev2", name: "Vault Backup 2", name_by_user: "Second Vault", identifiers: [["vault", "10.0.0.2:24085"]] },
    },
    language: options.language ?? "en",
    locale: { language: options.language ?? "en", number_format: options.numberFormat ?? "language", time_format: "language", time_zone: "local" },
    config: { time_zone: "Australia/Brisbane" },
    connection: options.connection ?? {},
    callWS: async (msg) => {
      calls.push({ type: "ws", msg });
      if (options.wsError) throw new Error(options.wsError);
      if (msg.type === "vault/entity_map") return { entries: options.noEntries ? [] : entryMap };
      throw new Error(`Unexpected ${msg.type}`);
    },
    callService: async (domain, service, data) => {
      calls.push({ type: "service", domain, service, data });
      if (options.serviceError) throw new Error(options.serviceError);
    },
    formatEntityState: (stateObj) => {
      const unit = stateObj.attributes.unit_of_measurement;
      if (stateObj.attributes.device_class === "enum") return TITLE_CASE(stateObj.state);
      if (stateObj.state === "unavailable") return "Unavailable";
      return unit ? `${stateObj.state} ${unit}` : stateObj.state;
    },
  };
  return { hass, calls };
}
