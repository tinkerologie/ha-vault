import { expect, test } from "@playwright/test";
import {
  buildModel,
  jobLevel,
  readBytes,
  recentRuns,
  selectEntry,
  worstLevel,
  type EntryMap,
  type JobSignals,
} from "../../src/model";
import { buildScenario } from "../browser/mock-hass.js";

const base: JobSignals = {
  status: "completed",
  running: false,
  problem: false,
  lastRunSuccessful: true,
  itemsFailed: 0,
  enabled: true,
};

function model(scenario: string) {
  const { states, entryMap } = buildScenario(scenario, Date.UTC(2026, 10, 5, 4));
  return buildModel(states, entryMap[0] as EntryMap);
}

test.describe("jobLevel", () => {
  const cases: [string, Partial<JobSignals>, string][] = [
    ["completed", {}, "ok"],
    ["running sensor wins over a failed last run", { running: true, status: "failed" }, "running"],
    ["running status", { status: "running" }, "running"],
    ["failed", { status: "failed" }, "failed"],
    ["partial", { status: "partial" }, "warning"],
    ["skipped", { status: "skipped" }, "warning"],
    ["cancelled", { status: "cancelled" }, "warning"],
    ["failed items", { itemsFailed: 1 }, "warning"],
    ["problem on alone is a warning, not a failure", { problem: true }, "warning"],
    ["unsuccessful last run alone is a warning", { lastRunSuccessful: false }, "warning"],
    ["never run", { status: "idle", lastRunSuccessful: false }, "idle"],
    ["disabled", { enabled: false }, "disabled"],
    ["disabled but failed stays failed", { enabled: false, status: "failed" }, "failed"],
    ["no usable status is unknown, never ok", { status: null }, "unknown"],
    ["no status and running unknown", { status: null, running: null }, "unknown"],
  ];
  for (const [name, signals, expected] of cases) {
    test(name, () => {
      expect(jobLevel({ ...base, ...signals })).toBe(expected);
    });
  }

  test("worstLevel orders failed first and idle last", () => {
    expect(worstLevel(["ok", "warning", "failed"])).toBe("failed");
    expect(worstLevel(["ok", "unknown"])).toBe("unknown");
    expect(worstLevel([])).toBe("idle");
  });
});

test.describe("buildModel", () => {
  test("healthy server is ok with nothing needing attention", () => {
    const m = model("healthy");
    expect(m.level).toBe("ok");
    expect(m.attention).toEqual([]);
    expect(m.jobs.map((j) => j.level)).toEqual(["ok", "ok", "disabled", "idle"]);
    // Run history shows how a disabled job's last run went.
    expect(m.jobs.map((j) => j.outcome)).toEqual(["ok", "ok", "ok", "idle"]);
    expect(m.coverage).toEqual({ protected: 19, unprotected: 0, pending: 0 });
    expect(m.rules).toEqual({ destinations: 3, mediaTypes: 2, remote: 2 });
  });

  test("a failed job makes the server failed and names the job", () => {
    const m = model("failed");
    expect(m.level).toBe("failed");
    expect(m.jobs[0]?.level).toBe("failed");
    expect(m.attention[0]).toMatchObject({ kind: "job_failed", subject: "Daily Containers Backup" });
  });

  test("all entities unavailable is unknown, not healthy, covered or running", () => {
    const m = model("unavailable");
    expect(m.level).toBe("unknown");
    expect(m.online).toBeNull();
    expect(m.version).toBeNull();
    expect(m.running).toEqual([]);
    expect(m.activeJob).toBeNull();
    expect(m.coverage).toEqual({ protected: null, unprotected: null, pending: null });
    expect(m.rules).toEqual({ destinations: null, mediaTypes: null, remote: null });
    expect(m.jobs.every((j) => j.level === "unknown")).toBe(true);
    expect(m.storage.every((d) => d.level === "unknown" && d.usedPercent === null)).toBe(true);
    expect(m.attention.map((a) => a.kind)).toEqual(["unreachable"]);
  });

  test("a job with an unknown status keeps the server from reading healthy", () => {
    const { states, entryMap } = buildScenario("healthy", Date.UTC(2026, 10, 5, 4));
    const status = (entryMap[0] as EntryMap).jobs[0]!.entities.job_status!;
    states[status] = { ...states[status], state: "unavailable" };
    const m = buildModel(states, entryMap[0] as EntryMap);
    expect(m.attention.map((a) => a.kind)).toEqual(["job_unknown"]);
    expect(m.level).toBe("unknown");
  });

  test("a missing online entity isn't treated as online", () => {
    const m = model("missing_online");
    expect(m.online).toBeNull();
    // The daemon status is still ok, so it isn't flagged unreachable, but the
    // server isn't called healthy without knowing it's online.
    expect(m.attention).toEqual([]);
    expect(m.level).toBe("unknown");
  });

  test("run history shows the last finished backup while a backup or restore runs", () => {
    expect(model("running").jobs[0]?.outcome).toBe("ok");
    expect(model("restoring").jobs[2]?.outcome).toBe("ok");
    expect(model("restoring").jobs[2]?.level).toBe("running");
  });

  test("running backup", () => {
    const m = model("running");
    expect(m.level).toBe("running");
    expect(m.running.map((j) => j.name)).toEqual(["Daily Containers Backup"]);
    expect(m.running[0]?.progress).toBe(42);
  });

  test("anomalies, unprotected items and job problems all need attention", () => {
    const m = model("attention");
    expect(m.attention.map((a) => a.kind)).toEqual(["job_warning", "anomalies", "unprotected"]);
    expect(m.attention.find((a) => a.kind === "anomalies")?.level).toBe("failed");
    expect(m.level).toBe("failed");
    expect(m.coverage).toEqual({ protected: 19, unprotected: 3, pending: 1 });
  });

  test("recent runs are newest first and skip jobs that never ran", () => {
    const m = model("healthy");
    expect(recentRuns(m.jobs).map((j) => j.name)).toEqual([
      "Home Assistant Backup",
      "Daily Containers Backup",
      "VMs Backup Test",
    ]);
  });

  test("storage usage uses each entity's unit", () => {
    const m = model("healthy");
    expect(Math.round(m.storage[0]?.usedPercent ?? 0)).toBe(5);
    expect(m.storage[1]?.usedPercent).toBeNull();
    expect(m.storage[2]?.usedPercent).toBe(88);
  });
});

test.describe("helpers", () => {
  test("readBytes converts decimal and binary units", () => {
    const states = {
      "sensor.a": { entity_id: "sensor.a", state: "2", attributes: { unit_of_measurement: "TB" }, last_changed: "", last_updated: "" },
      "sensor.b": { entity_id: "sensor.b", state: "1", attributes: { unit_of_measurement: "GiB" }, last_changed: "", last_updated: "" },
      "sensor.c": { entity_id: "sensor.c", state: "1", attributes: { unit_of_measurement: "parsecs" }, last_changed: "", last_updated: "" },
    };
    expect(readBytes(states, "sensor.a")).toBe(2e12);
    expect(readBytes(states, "sensor.b")).toBe(2 ** 30);
    expect(readBytes(states, "sensor.c")).toBeNull();
  });

  test("selectEntry matches device id, device name, entry title, else the first", () => {
    const { entryMap } = buildScenario();
    const names = { dev1: ["Vault Backup"], dev2: ["Vault Backup 2", "Second Vault"] };
    expect(selectEntry(entryMap as EntryMap[], "dev2", names)?.entry_id).toBe("entry2");
    expect(selectEntry(entryMap as EntryMap[], "second vault", names)?.entry_id).toBe("entry2");
    expect(selectEntry(entryMap as EntryMap[], "Vault (10.0.0.2)", names)?.entry_id).toBe("entry2");
    expect(selectEntry(entryMap as EntryMap[], undefined, names)?.entry_id).toBe("entry1");
    expect(selectEntry(entryMap as EntryMap[], "gone", names)?.entry_id).toBe("entry1");
  });
});
