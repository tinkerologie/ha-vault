import { expect, test, type Page } from "@playwright/test";

type Win = Window & {
  fixtureReady?: boolean;
  render: (scenario?: string, options?: Record<string, unknown>) => Promise<void>;
  updateHass: (mutate: (hass: Record<string, unknown>) => void) => Promise<void>;
  calls: { type: string; domain?: string; service?: string; data?: unknown; msg?: unknown }[];
  events: { type: string; detail: unknown }[];
  customCards: { type: string; preview?: boolean; documentationURL?: string; getEntitySuggestion?: unknown }[];
  loadCardHelpers?: () => Promise<unknown>;
};

const TAGS = [
  "vault-health-card",
  "vault-protected-card",
  "vault-next-run-card",
  "vault-last-backup-card",
  "vault-progress-card",
  "vault-jobs-card",
  "vault-activity-card",
  "vault-storage-card",
  "vault-anomalies-card",
  "vault-rules-card",
  "vault-dashboard-card",
];

async function render(page: Page, scenario = "healthy", options: Record<string, unknown> = {}) {
  await page.evaluate(([s, o]) => (window as unknown as Win).render(s as string, o as Record<string, unknown>), [scenario, options] as const);
}

const card = (page: Page, tag: string) => page.locator(`#${tag}`);

test.beforeEach(async ({ page }) => {
  await page.goto("/test/browser/fixture.html");
  await page.waitForFunction(() => (window as unknown as Win).fixtureReady === true);
});

test.describe("registration and editor (#101)", () => {
  test("every card is defined and listed in the picker with a live preview", async ({ page }) => {
    const entries = await page.evaluate(() => (window as unknown as Win).customCards);
    expect(entries.map((e) => e.type).sort()).toEqual([...TAGS].sort());
    for (const entry of entries) {
      expect(entry.preview).toBe(true);
      expect(entry.documentationURL).toContain("tinkerologie/ha-vault");
    }
  });

  test("cards use Home Assistant's form editor with a Vault device selector", async ({ page }) => {
    const forms = await page.evaluate((tags) => {
      return tags.map((tag) => {
        const ctor = customElements.get(tag) as unknown as {
          getConfigElement?: unknown;
          getConfigForm: () => { schema: { name: string; selector: Record<string, unknown> }[]; computeLabel: (s: { name: string }) => string };
          getStubConfig: () => Record<string, unknown>;
        };
        const form = ctor.getConfigForm();
        return {
          tag,
          customEditor: ctor.getConfigElement !== undefined,
          names: form.schema.map((s) => s.name),
          server: form.schema[0]?.selector,
          label: form.computeLabel({ name: "server" }),
          stub: ctor.getStubConfig(),
        };
      });
    }, TAGS);
    for (const form of forms) {
      expect(form.customEditor, form.tag).toBe(false);
      expect(form.names.slice(0, 2)).toEqual(["server", "title"]);
      expect(form.server).toEqual({ device: { filter: { integration: "vault" } } });
      expect(form.label).toBe("Vault server");
      expect(form.stub).toEqual({});
    }
  });

  test("anomalies card is suggested only for a Vault open anomalies sensor", async ({ page }) => {
    await render(page);
    const result = await page.evaluate(() => {
      const w = window as unknown as Win & { hass: unknown };
      const entry = w.customCards.find((c) => c.type === "vault-anomalies-card") as {
        getEntitySuggestion: (hass: unknown, id: string) => unknown;
      };
      const others = w.customCards.filter((c) => c.type !== "vault-anomalies-card" && c.getEntitySuggestion);
      return {
        match: entry.getEntitySuggestion(w.hass, "sensor.vault_backup_open_anomalies"),
        other: entry.getEntitySuggestion(w.hass, "sensor.vault_backup_status"),
        others: others.length,
      };
    });
    expect(result.match).toEqual({ config: { type: "custom:vault-anomalies-card", server: "dev1" } });
    expect(result.other).toBeNull();
    expect(result.others).toBe(0);
  });

  test("an older config naming the server by device name still works", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-storage-card"], config: { server: "Second Vault" } });
    await expect(card(page, "vault-storage-card")).toContainText("Other server disk");
    await expect(card(page, "vault-storage-card")).not.toContainText("Backups");
  });
});

test.describe("status (#94)", () => {
  test("healthy server", async ({ page }) => {
    await render(page);
    await expect(card(page, "vault-health-card")).toContainText("Healthy");
    await expect(card(page, "vault-health-card")).toContainText("Nothing needs attention");
    await expect(card(page, "vault-health-card")).not.toContainText("100");
  });

  test("a failed job is never shown as healthy", async ({ page }) => {
    await render(page, "failed");
    await expect(card(page, "vault-health-card")).toContainText("Problem");
    await expect(card(page, "vault-health-card")).toContainText("Daily Containers Backup failed");
    await expect(card(page, "vault-health-card")).not.toContainText("Healthy");
    const job = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
    await expect(job.locator(".badge")).toHaveText("Failed");
    await expect(card(page, "vault-dashboard-card")).toContainText("Daily Containers Backup failed");
    await expect(card(page, "vault-last-backup-card")).not.toContainText("Failed");
  });

  test("unavailable data is never healthy, covered or running", async ({ page }) => {
    await render(page, "unavailable");
    const text = await page.locator("#container").innerText();
    for (const claim of ["Healthy", "All items are backed up", "Running now", "Backing up", "Online", "vunavailable", "NaN"]) {
      expect(text, claim).not.toContain(claim);
    }
    await expect(card(page, "vault-health-card")).toContainText("Status unknown");
    await expect(card(page, "vault-protected-card")).toContainText("Coverage unknown");
    await expect(card(page, "vault-rules-card")).toContainText("Unknown");
    await expect(card(page, "vault-storage-card")).toContainText("Health unknown");
  });
});

test.describe("accurate details (#95, #96)", () => {
  test("protected counts come from Vault's coverage, including items no job covers", async ({ page }) => {
    await render(page, "attention");
    const c = card(page, "vault-protected-card");
    await expect(c.locator(".value")).toContainText("19");
    await expect(c.locator(".value")).toContainText("of 22");
    await expect(c).toContainText("3 items aren't backed up");
    await expect(c).toContainText("1 waiting for its first backup");
    await expect(c.locator('[role="meter"]')).toHaveAttribute("aria-valuenow", "19");
  });

  test("3-2-1 shows unmet rules with a distinct icon and a Not met badge", async ({ page }) => {
    await render(page, "attention");
    const c = card(page, "vault-rules-card");
    await expect(c.locator(".header .badge")).toHaveText("Not met");
    await expect(c).toContainText("1 destination backed up to");
    await expect(c).toContainText("Local only");
    await expect(c.locator(".status-icon.lvl-failed")).toHaveCount(3);
    await expect(c).toContainText("any network destination counts as remote");
  });

  test("3-2-1 met", async ({ page }) => {
    await render(page);
    await expect(card(page, "vault-rules-card").locator(".header .badge")).toHaveText("Likely met");
  });

  test("next run uses the scheduled time, not the first job found", async ({ page }) => {
    await render(page);
    const c = card(page, "vault-next-run-card");
    await expect(c.locator(".value")).toHaveText("in 22 hours");
    await expect(c).toContainText("Daily Containers Backup");
    await expect(c).toContainText("4 jobs, 3 enabled");
  });

  test("job counts agree and disabled jobs say so", async ({ page }) => {
    await render(page);
    await expect(card(page, "vault-jobs-card").locator("ul.list > li")).toHaveCount(4);
    const disabled = card(page, "vault-jobs-card").locator("li", { hasText: "VMs Backup Test" }).first();
    await expect(disabled.locator(".badge")).toHaveText("Disabled");
    const enabled = card(page, "vault-jobs-card").locator("li", { hasText: "Home Assistant Backup" }).first();
    await expect(enabled).toContainText("Next in 23 hours");
    await expect(enabled).toContainText("5 restore points");
    await expect(card(page, "vault-jobs-card").locator("li", { hasText: "much longer name" }).first()).toContainText("Never run");
  });

  test("activity is newest first with each job's real outcome and singular counts", async ({ page }) => {
    await render(page, "failed");
    const rows = card(page, "vault-activity-card").locator("ol.list > li");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("Home Assistant Backup");
    await expect(rows.nth(0)).toContainText("1 item");
    await expect(rows.nth(0)).not.toContainText("1 items");
    await expect(rows.nth(1)).toContainText("Daily Containers Backup");
    await expect(rows.nth(1).locator(".badge")).toHaveText("Failed");
  });

  test("storage is scoped to the selected server", async ({ page }) => {
    await render(page);
    const c = card(page, "vault-storage-card");
    await expect(c.locator("ul.list > li")).toHaveCount(3);
    await expect(c).not.toContainText("Other server disk");
    await expect(c).toContainText("Capacity not reported");
  });
});

test.describe("summary card (#98)", () => {
  test("idle: no progress panel, attention first", async ({ page }) => {
    await render(page, "attention");
    const c = card(page, "vault-dashboard-card");
    await expect(c).not.toContainText("No backup running");
    await expect(c.locator('[role="progressbar"]')).toHaveCount(0);
    await expect(c).toContainText("2 open anomalies");
    await expect(c).toContainText("Backup shrank to 0 B");
    const attentionY = (await c.getByText("2 open anomalies").boundingBox())!.y;
    const lastBackupY = (await c.getByText("Last backup").boundingBox())!.y;
    expect(attentionY).toBeLessThan(lastBackupY);
    await expect(c.getByRole("link", { name: "Open in Vault" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("running: shows progress", async ({ page }) => {
    await render(page, "running");
    const bar = card(page, "vault-dashboard-card").locator('[role="progressbar"]');
    await expect(bar).toHaveCount(1);
    await expect(bar).toHaveAttribute("aria-valuenow", "42");
    await expect(card(page, "vault-dashboard-card").locator(".header .badge")).toHaveText("Backing up");
  });
});

test.describe("actions (#100)", () => {
  test("Run backup asks first, then presses the job's button", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    const row = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
    await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
    await expect(row.getByRole("group")).toContainText("may stop containers or VMs");
    expect(await page.evaluate(() => (window as unknown as Win).calls.filter((c) => c.type === "service"))).toEqual([]);

    await row.getByRole("button", { name: "Cancel" }).click();
    await expect(row.getByRole("group")).toHaveCount(0);

    await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
    await row.getByRole("button", { name: "Run backup", exact: true }).click();
    await expect(row.getByRole("button", { name: "Started" })).toBeVisible();
    const services = await page.evaluate(() => (window as unknown as Win).calls.filter((c) => c.type === "service"));
    expect(services).toEqual([
      { type: "service", domain: "button", service: "press", data: { entity_id: "button.vault_backup_daily_containers_backup_run_now" } },
    ]);
  });

  test("Home Assistant's confirmation dialog is used when available", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    await page.evaluate(() => {
      const w = window as unknown as Win & { dialogs: unknown[] };
      w.dialogs = [];
      w.loadCardHelpers = async () => ({
        showConfirmationDialog: async (_el: unknown, params: unknown) => {
          w.dialogs.push(params);
          return true;
        },
      });
    });
    await card(page, "vault-jobs-card").getByRole("button", { name: "Run Home Assistant Backup now" }).click();
    await expect(card(page, "vault-jobs-card").getByRole("button", { name: "Started" })).toBeVisible();
    const dialogs = await page.evaluate(() => (window as unknown as { dialogs: { title: string; confirmText: string }[] }).dialogs);
    expect(dialogs).toEqual([expect.objectContaining({ title: "Run Home Assistant Backup now?", confirmText: "Run backup" })]);
  });

  test("a failed Run backup shows an alert in the card", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"], serviceError: "Vault is offline" });
    const row = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
    await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
    await row.getByRole("button", { name: "Run backup", exact: true }).click();
    await expect(row.getByRole("alert")).toHaveText(/Couldn't start Daily Containers Backup: Vault is offline/);
    await row.getByRole("button", { name: "Dismiss" }).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    expect(await row.getByRole("button", { name: "Dismiss" }).evaluate((el) => getComputedStyle(el).outlineWidth)).toBe("2px");
    await row.getByRole("button", { name: "Dismiss" }).click();
    await expect(row.getByRole("alert")).toHaveCount(0);
  });

  test("Restore is replaced by Open in Vault, which says what it does", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    const c = card(page, "vault-jobs-card");
    await expect(c.getByText("Restore", { exact: true })).toHaveCount(0);
    const link = c.getByRole("link", { name: "Open in Vault" });
    await expect(link).toHaveAttribute("href", "http://192.168.20.21");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("entity-backed values open more-info by click and keyboard", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card", "vault-protected-card"] });
    await card(page, "vault-jobs-card").getByRole("button", { name: "Daily Containers Backup", exact: true }).click();
    await card(page, "vault-protected-card").locator("button.link").first().focus();
    await page.keyboard.press("Enter");
    const events = await page.evaluate(() => (window as unknown as Win).events);
    expect(events).toEqual([
      { type: "hass-more-info", detail: { entityId: "sensor.vault_backup_daily_containers_backup_status" } },
      { type: "hass-more-info", detail: { entityId: "sensor.vault_backup_protected_items" } },
    ]);
  });

  test("action buttons are at least 36 px tall", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    const heights = await card(page, "vault-jobs-card").locator(".btn").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThan(0);
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(36);
  });
});

test.describe("accessibility (#103)", () => {
  test("titles are headings: h2 alone, h3 inside the summary card", async ({ page }) => {
    await render(page);
    for (const tag of TAGS) {
      await expect(card(page, tag).locator("h2"), tag).toHaveCount(1);
    }
    await expect(card(page, "vault-jobs-card").getByRole("heading", { level: 2 })).toHaveText("Backup jobs");
    await render(page, "healthy", { tags: ["vault-jobs-card"], config: { embedded: true, title: "Jobs" } });
    await expect(card(page, "vault-jobs-card").getByRole("heading", { level: 3 })).toHaveText("Jobs");
  });

  test("icons are hidden from assistive technology", async ({ page }) => {
    await render(page, "attention");
    const visible = await page.evaluate((tags) =>
      tags.flatMap((tag) => [...(document.getElementById(tag)!.shadowRoot!.querySelectorAll("svg"))]).filter((svg) => svg.getAttribute("aria-hidden") !== "true").length
    , TAGS);
    expect(visible).toBe(0);
  });

  test("storage usage is a named meter with a value", async ({ page }) => {
    await render(page);
    const meter = card(page, "vault-storage-card").getByRole("meter", { name: "Space used on NAS share" });
    await expect(meter).toHaveAttribute("aria-valuenow", "88");
    await expect(meter).toHaveAttribute("aria-valuetext", "88% used");
  });

  test("Run backup keeps focus while starting and shows a 2 px focus ring", async ({ page }) => {
    await render(page, "running", { tags: ["vault-jobs-card"] });
    const busy = card(page, "vault-jobs-card").getByRole("button", { name: "Running" });
    await expect(busy).toHaveAttribute("aria-disabled", "true");
    await busy.focus();
    await page.keyboard.press("Enter");
    await expect(busy).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const outline = await busy.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).toBe("2px");
  });

  test("animations stop under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await render(page, "running", { tags: ["vault-progress-card"] });
    const animation = await card(page, "vault-progress-card").locator(".meter-fill").evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });
});

test.describe("localization and updates (#102)", () => {
  test("numbers follow the user's number format", async ({ page }) => {
    await page.evaluate(() => undefined);
    await render(page, "healthy", { tags: ["vault-jobs-card"], numberFormat: "decimal_comma" });
    await expect(card(page, "vault-jobs-card")).toContainText("5 restore points");
  });

  test("dates follow the user's language instead of en-US", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-activity-card", "vault-next-run-card"], language: "de" });
    await expect(card(page, "vault-next-run-card").locator(".value")).toHaveText("in 22 Stunden");
  });

  test("unrelated state changes don't re-render cards", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-health-card"] });
    const counts = await page.evaluate(async () => {
      const el = document.getElementById("vault-health-card") as HTMLElement & { renderCount?: number; render: () => unknown };
      let renders = 0;
      const original = el.render.bind(el);
      el.render = () => {
        renders += 1;
        return original();
      };
      const w = window as unknown as Win;
      await w.updateHass((hass) => {
        (hass.states as Record<string, unknown>)["light.kitchen"] = { entity_id: "light.kitchen", state: "on", attributes: {} };
      });
      const unrelated = renders;
      await w.updateHass((hass) => {
        const states = hass.states as Record<string, { state: string }>;
        states["sensor.vault_backup_status"] = { ...states["sensor.vault_backup_status"]!, state: "degraded" };
      });
      return { unrelated, related: renders };
    });
    expect(counts.unrelated).toBe(0);
    expect(counts.related).toBe(1);
    await expect(card(page, "vault-health-card")).toContainText("Vault reports degraded");
  });

  test("an entity map error is shown, not 'no jobs'", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"], wsError: "Unknown command." });
    await expect(card(page, "vault-jobs-card").getByRole("alert")).toContainText("Couldn't load Vault entities: Unknown command.");
  });

  test("without a Vault server the card says so", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-health-card"], noEntries: true });
    await expect(card(page, "vault-health-card")).toContainText("No Vault server found");
  });
});

test.describe("sizing (#97)", () => {
  // Slot widths a card gets in a sections view: half of a section on a
  // 390 px phone, half and full section at 1440 px, and a 4-column span.
  for (const width of [175, 220, 366, 450, 1400]) {
    test(`no card clips or overflows at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width: Math.max(width + 40, 390), height: 900 });
      await render(page, "attention", { width });
      const problems = await page.evaluate((tags) => {
        const found: string[] = [];
        for (const tag of tags) {
          const host = document.getElementById(tag)!;
          const haCard = host.shadowRoot!.querySelector("ha-card") as HTMLElement;
          if (haCard.scrollWidth > haCard.clientWidth + 1) found.push(`${tag}: horizontal overflow ${haCard.scrollWidth} > ${haCard.clientWidth}`);
          if (haCard.scrollHeight > haCard.clientHeight + 1) found.push(`${tag}: clipped vertically`);
          const box = haCard.getBoundingClientRect();
          for (const control of host.shadowRoot!.querySelectorAll("button, a")) {
            const r = control.getBoundingClientRect();
            if (r.width === 0) continue;
            if (r.left < box.left - 1 || r.right > box.right + 1) found.push(`${tag}: control outside card`);
          }
        }
        return found;
      }, TAGS);
      expect(problems).toEqual([]);
    });
  }

  test("grid options size lists automatically and the summary spans the full width", async ({ page }) => {
    await render(page);
    const options = await page.evaluate((tags) =>
      Object.fromEntries(tags.map((tag) => [tag, (document.getElementById(tag) as unknown as { getGridOptions: () => unknown }).getGridOptions()]))
    , TAGS);
    for (const tag of TAGS) expect((options[tag] as { rows: unknown }).rows, tag).toBe("auto");
    expect(options["vault-dashboard-card"]).toMatchObject({ columns: "full" });
    expect(options["vault-health-card"]).toMatchObject({ columns: 6 });
    expect(options["vault-jobs-card"]).toMatchObject({ columns: 12 });
  });

  test("getCardSize is close to the real height", async ({ page }) => {
    await render(page, "attention", { width: 490 });
    const sizes = await page.evaluate((tags) =>
      tags.map((tag) => {
        const el = document.getElementById(tag) as unknown as HTMLElement & { getCardSize: () => number };
        return { tag, estimate: el.getCardSize() * 50, actual: el.getBoundingClientRect().height };
      })
    , TAGS);
    for (const { tag, estimate, actual } of sizes) {
      expect(Math.abs(estimate - actual), `${tag}: estimate ${estimate} vs ${actual}`).toBeLessThanOrEqual(150);
    }
  });
});

test.describe("theme colors (#99)", () => {
  for (const theme of ["light", "dark"]) {
    test(`text meets 4.5:1 contrast in the ${theme} theme`, async ({ page }) => {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      for (const scenario of ["attention", "failed", "running", "restoring"]) {
        await render(page, scenario);
        const failures = await page.evaluate(contrastFailures, TAGS);
        expect(failures, scenario).toEqual([]);
      }
      // The inline confirmation and the error alert too.
      await render(page, "healthy", { tags: ["vault-jobs-card"], serviceError: "Vault is offline" });
      const row = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
      await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
      expect(await page.evaluate(contrastFailures, ["vault-jobs-card"]), "confirm").toEqual([]);
      await row.getByRole("button", { name: "Run backup", exact: true }).click();
      await expect(row.getByRole("alert")).toBeVisible();
      expect(await page.evaluate(contrastFailures, ["vault-jobs-card"]), "alert").toEqual([]);
    });
  }

  test("cards follow a custom primary color", async ({ page }) => {
    await page.evaluate(() => document.documentElement.style.setProperty("--primary-color", "rgb(156, 39, 176)"));
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    const color = await card(page, "vault-jobs-card").locator(".title-icon").evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(156, 39, 176)");
  });
});

/** Runs in the page: every text node's color against the background it's drawn on. */
function contrastFailures(tags: string[]): string[] {
  const parse = (value: string): number[] => {
    const m = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
    if (value.startsWith("color(srgb")) return [m[0]! * 255, m[1]! * 255, m[2]! * 255, m[3] ?? 1];
    return [m[0]!, m[1]!, m[2]!, m[3] ?? 1];
  };
  const blend = (top: number[], bottom: number[]) => {
    const a = top[3]!;
    return [0, 1, 2].map((i) => top[i]! * a + bottom[i]! * (1 - a)).concat(1);
  };
  const lum = (c: number[]) => {
    const [r, g, b] = c.slice(0, 3).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const background = (el: Element | null): number[] => {
    const layers: number[][] = [];
    let node: Element | null = el;
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg[3]! > 0) layers.push(bg);
      if (bg[3] === 1) break;
      node = node.parentElement ?? ((node.getRootNode() as ShadowRoot).host ?? null);
    }
    let result = layers.length && layers[layers.length - 1]![3] === 1 ? layers.pop()! : parse(getComputedStyle(document.body).backgroundColor);
    while (layers.length) result = blend(layers.pop()!, result);
    return result;
  };
  const failures: string[] = [];
  for (const tag of tags) {
    const root = document.getElementById(tag)!.shadowRoot!;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const el = text.parentElement;
      if (!el || !text.textContent?.trim()) continue;
      if (el.closest(".visually-hidden")) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      const bg = background(el);
      const fg = blend(parse(style.color), bg);
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      const ratio = (a! + 0.05) / (b! + 0.05);
      if (ratio < 4.5) failures.push(`${tag}: "${text.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`);
    }
  }
  return failures;
}

test("a disabled job's completed run shows as completed in run history", async ({ page }) => {
  await render(page, "healthy", { tags: ["vault-activity-card", "vault-jobs-card"] });
  const activity = card(page, "vault-activity-card").locator("li", { hasText: "VMs Backup Test" });
  await expect(activity.locator(".badge")).toHaveText("Completed");
  const jobs = card(page, "vault-jobs-card").locator("li", { hasText: "VMs Backup Test" }).first();
  await expect(jobs.locator(".badge")).toHaveText("Disabled");
});

test.describe("restore vs backup in progress", () => {
  test("a running restore is labelled as a restore everywhere", async ({ page }) => {
    await render(page, "restoring");
    const progress = card(page, "vault-progress-card");
    await expect(progress.getByRole("heading")).toHaveText("Restore in progress");
    await expect(progress.locator(".row .badge")).toHaveText(/Restoring/);
    await expect(progress.getByRole("progressbar", { name: "Restore progress of VMs Backup Test" })).toHaveAttribute("aria-valuenow", "30");
    await expect(card(page, "vault-dashboard-card").locator(".header .badge")).toHaveText("Restoring");
    await expect(card(page, "vault-next-run-card").locator(".value")).toHaveText("Restore running now");
    const job = card(page, "vault-jobs-card").locator("li", { hasText: "VMs Backup Test" }).first();
    await expect(job.locator(".row-title .badge")).toHaveText("Restoring");
    await expect(job.getByRole("button", { name: "Restoring" })).toHaveAttribute("aria-disabled", "true");
    const text = await page.locator("#container").innerText();
    expect(text).not.toContain("Backing up");
    expect(text).not.toContain("Backup in progress");
  });

  test("a running backup is labelled as a backup", async ({ page }) => {
    await render(page, "running");
    const progress = card(page, "vault-progress-card");
    await expect(progress.getByRole("heading")).toHaveText("Backup in progress");
    await expect(progress.locator(".row .badge")).toHaveText(/Backing up · 42%/);
    await expect(card(page, "vault-next-run-card").locator(".value")).toHaveText("Running now");
  });
});

test("during a restore, run history keeps the last backup's outcome and the progress badge says Restoring", async ({ page }) => {
  await render(page, "restoring");
  await expect(card(page, "vault-progress-card").locator(".header .badge")).toHaveText("Restoring");
  const activity = card(page, "vault-activity-card").locator("li", { hasText: "VMs Backup Test" });
  await expect(activity.locator(".badge")).toHaveText("Completed");
});

test("a card that found no Vault server looks again, for an entry that finishes setting up", async ({ page }) => {
  await page.clock.install();
  await page.goto("/test/browser/fixture.html");
  await page.waitForFunction(() => (window as unknown as Win).fixtureReady === true);
  await render(page, "healthy", { tags: ["vault-health-card"], noEntries: true });
  await expect(card(page, "vault-health-card")).toContainText("No Vault server found");
  // The entry finishes setting up; its registry entries (hass.entities) don't change.
  await page.evaluate(async () => {
    const { buildScenario } = await import("/test/browser/mock-hass.js");
    const { entryMap } = buildScenario();
    (window as unknown as { hass: { callWS: unknown } }).hass.callWS = async () => ({ entries: entryMap });
  });
  await page.clock.runFor(31_000);
  await expect(card(page, "vault-health-card")).toContainText("Healthy");
});

test.describe("action fallbacks", () => {
  test("without a run button entity, Run backup calls vault.run_backup with the job id", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    await page.evaluate(async () => {
      const el = document.getElementById("vault-jobs-card") as HTMLElement & { _entries: { jobs: { entities: Record<string, string> }[] }[]; requestUpdate: () => void; updateComplete: Promise<unknown> };
      for (const job of el._entries[0]!.jobs) delete job.entities.run_backup;
      el._entries = [...el._entries];
      await el.updateComplete;
    });
    const row = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
    await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
    await row.getByRole("button", { name: "Run backup", exact: true }).click();
    await expect(row.getByRole("button", { name: "Started" })).toBeVisible();
    const services = await page.evaluate(() => (window as unknown as Win).calls.filter((c) => c.type === "service"));
    expect(services).toEqual([{ type: "service", domain: "vault", service: "run_backup", data: { job_id: 1 } }]);
  });

  test("when the card helpers fail to load, Run backup asks inline", async ({ page }) => {
    await render(page, "healthy", { tags: ["vault-jobs-card"] });
    await page.evaluate(() => {
      (window as unknown as Win).loadCardHelpers = async () => {
        throw new Error("helpers unavailable");
      };
    });
    const row = card(page, "vault-jobs-card").locator("li", { hasText: "Daily Containers Backup" }).first();
    await row.getByRole("button", { name: "Run Daily Containers Backup now" }).click();
    await expect(row.getByRole("group")).toContainText("may stop containers or VMs");
  });
});
