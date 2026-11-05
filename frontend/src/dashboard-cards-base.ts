import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import type { CardConfig, GridOptions } from "./config";
import { dashboardCardStyles } from "./dashboard-cards-styles";
import { loadEntityMap } from "./entity-map";
import { fireEvent, type HomeAssistant } from "./ha-types";
import {
  iconTemplate,
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiHelpCircleOutline,
  mdiMinusCircleOutline,
  mdiProgressClock,
} from "./icons";
import { localize, formatDateTime, formatRelative, languageOf, type Placeholders } from "./localize/localize";
import type { TranslationKey } from "./localize/en";
import { buildModel, onlyRestoring, selectEntry, trackedEntityIds, type EntryMap, type Job, type Level, type VaultModel } from "./model";

interface FormSchema {
  name: string;
  selector: Record<string, unknown>;
}

const LEVEL_ICONS: Record<Level, string> = {
  failed: mdiCloseCircleOutline,
  warning: mdiAlertCircleOutline,
  unknown: mdiHelpCircleOutline,
  running: mdiProgressClock,
  disabled: mdiMinusCircleOutline,
  ok: mdiCheckCircleOutline,
  idle: mdiMinusCircleOutline,
};

const RELATIVE_TIME_REFRESH_MS = 60_000;
/** How long a card waits before asking again after no Vault server or a failed request. */
const RETRY_AFTER_MS = 30_000;

export abstract class BaseVaultCard extends LitElement {
  static override styles = dashboardCardStyles;

  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    _entries: { state: true },
    _error: { state: true },
  };

  declare hass?: HomeAssistant;
  declare config: CardConfig;
  declare _entries?: EntryMap[];
  declare _error?: string;

  /** The model for the selected server; undefined while loading or when there's none. */
  protected model?: VaultModel;
  private _tracked = new Set<string>();
  private _loadingFor?: unknown;
  private _timer?: number;
  private _refetchTimer?: number;

  constructor() {
    super();
    this.config = { type: "" };
  }

  // -------------------------------------------------------------------------
  // Card API used by Home Assistant
  // -------------------------------------------------------------------------

  /** Extra fields for the visual editor; most cards only pick a server and a title. */
  protected static extraFormSchema(): FormSchema[] {
    return [];
  }

  static getConfigForm() {
    const schema: FormSchema[] = [
      { name: "server", selector: { device: { filter: { integration: "vault" } } } },
      { name: "title", selector: { text: {} } },
      ...this.extraFormSchema(),
    ];
    const labels: Record<string, TranslationKey> = {
      server: "editor.server",
      title: "editor.title",
      max_items: "editor.max_items",
    };
    return {
      schema,
      computeLabel: (field: { name: string }) =>
        labels[field.name] ? localize(undefined, labels[field.name] as TranslationKey) : undefined,
      computeHelper: (field: { name: string }) =>
        field.name === "server" ? localize(undefined, "editor.server_helper") : undefined,
    };
  }

  /** A new card works without any options: it shows the first Vault server. */
  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  setConfig(config: CardConfig): void {
    if (!config || typeof config.type !== "string") {
      throw new Error("Invalid card configuration");
    }
    this.config = { ...config };
  }

  /** Rough height in 50 px units, for masonry views. */
  getCardSize(): number {
    return 2;
  }

  getGridOptions(): GridOptions {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    // Relative times ("in 3 hours") go stale without state changes.
    this._timer = window.setInterval(() => this.requestUpdate(), RELATIVE_TIME_REFRESH_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
    if (this._refetchTimer !== undefined) {
      // A retry was pending: load again when the card is shown again.
      window.clearTimeout(this._refetchTimer);
      this._refetchTimer = undefined;
      this._loadingFor = undefined;
    }
  }

  /**
   * Re-render only for changes the card shows: its config, the server's
   * entity map, the user's language and formats, or one of the server's
   * entities. Other state changes in Home Assistant don't touch the card.
   */
  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!changed.has("hass") || changed.size > 1) return true;
    const old = changed.get("hass") as HomeAssistant | undefined;
    const hass = this.hass;
    if (!old || !hass) return true;
    // Nothing loaded yet, or the last request failed: every update is a chance to retry.
    if (!this.model) return true;
    if (old.locale !== hass.locale || old.language !== hass.language || old.devices !== hass.devices) return true;
    if (old.entities !== hass.entities) return true;
    for (const entityId of this._tracked) {
      if (old.states[entityId] !== hass.states[entityId]) return true;
    }
    return false;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    this.toggleAttribute("embedded", Boolean(this.config.embedded));
    if (this.hass && this._loadingFor !== this.hass.entities) {
      this._loadingFor = this.hass.entities;
      loadEntityMap(this.hass).then(
        (entries) => {
          this._entries = entries;
          this._error = undefined;
          // No Vault server yet: an entry may still be setting up, so look again later.
          if (entries.length === 0) this.scheduleRetry();
        },
        (err: unknown) => {
          this._error = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
          // Don't retry on every state update while the request fails; a registry change retries at once.
          this.scheduleRetry();
        }
      );
    }
    const entry = this._entries ? this.selectedEntry(this._entries) : undefined;
    this.model = entry && this.hass ? buildModel(this.hass.states, entry) : undefined;
    this._tracked = new Set(entry ? trackedEntityIds(entry) : []);
  }

  /** Ask for the entity map again after a while, once. */
  private scheduleRetry(): void {
    if (this._refetchTimer) return;
    this._refetchTimer = window.setTimeout(() => {
      this._refetchTimer = undefined;
      this._loadingFor = undefined;
      this.requestUpdate();
    }, RETRY_AFTER_MS);
  }

  private selectedEntry(entries: EntryMap[]): EntryMap | undefined {
    const deviceNames: Record<string, string[]> = {};
    for (const device of Object.values(this.hass?.devices ?? {})) {
      deviceNames[device.id] = [device.name, device.name_by_user].filter((n): n is string => Boolean(n));
    }
    return selectEntry(entries, this.config.server, deviceNames);
  }

  protected override render(): TemplateResult {
    if (!this.hass) return html``;
    if (!this.model) {
      const message = this._error
        ? this.t("common.load_error", { error: this._error })
        : this._entries
          ? this.t("common.not_set_up")
          : this.t("common.loading");
      return html`<ha-card>
        ${this.renderHeader()}
        <div class=${this._error ? "alert" : "empty"} role=${this._error ? "alert" : nothing}>${message}</div>
      </ha-card>`;
    }
    return this.renderCard(this.model);
  }

  protected abstract renderCard(model: VaultModel): TemplateResult;

  /** The translation key of the card's default title. */
  protected abstract titleKey: TranslationKey;

  /** The icon next to the card's title. */
  protected abstract titleIcon: string;

  // -------------------------------------------------------------------------
  // Helpers for cards
  // -------------------------------------------------------------------------

  t(key: TranslationKey | string, placeholders?: Placeholders): string {
    return localize(this.hass, key, placeholders);
  }

  /**
   * The card title as a heading: h2 on its own, h3 inside the summary card.
   * A user title replaces the default one.
   */
  protected renderHeader(extra: TemplateResult | typeof nothing = nothing): TemplateResult {
    const text = this.config.title || this.t(this.titleKey);
    const content = html`${iconTemplate(this.titleIcon, 20, "icon title-icon")}<span class="title-text">${text}</span>`;
    return html`<div class="header">
      ${this.config.embedded ? html`<h3 class="title">${content}</h3>` : html`<h2 class="title">${content}</h2>`}
      ${extra}
    </div>`;
  }

  protected levelIcon(level: Level, size = 20): TemplateResult {
    return iconTemplate(LEVEL_ICONS[level], size);
  }

  protected levelBadge(level: Level, label: string): TemplateResult {
    return html`<span class="badge lvl-${level}">${this.levelIcon(level, 14)}${label}</span>`;
  }

  /** Open Home Assistant's more-info dialog, like built-in cards do on tap. */
  protected moreInfo(entityId: string | undefined): void {
    if (entityId) fireEvent(this, "hass-more-info", { entityId });
  }

  /**
   * Content that opens an entity's more-info dialog: a real button for
   * keyboard and screen reader users, styled like plain text.
   */
  entityLink(entityId: string | undefined, content: TemplateResult | string, className = ""): TemplateResult {
    if (!entityId || !this.hass?.states[entityId]) return html`<span class=${className}>${content}</span>`;
    return html`<button type="button" class="link ${className}" @click=${() => this.moreInfo(entityId)}>
      ${content}
    </button>`;
  }

  /** An entity's state formatted by Home Assistant: translated, with unit and the user's number format. */
  protected formatState(entityId: string | undefined): string {
    const stateObj = entityId ? this.hass?.states[entityId] : undefined;
    if (!stateObj) return this.t("common.unavailable");
    if (this.hass?.formatEntityState) return this.hass.formatEntityState(stateObj);
    const unit = stateObj.attributes.unit_of_measurement;
    return unit ? `${stateObj.state} ${String(unit)}` : stateObj.state;
  }

  protected relative(time: number): string {
    return formatRelative(this.hass, time);
  }

  protected dateTime(time: number): string {
    return formatDateTime(this.hass, time);
  }

  /** A time as "in 3 hours" with the exact date and time for hover and screen readers. */
  protected timeTemplate(time: number): TemplateResult {
    return html`<time datetime=${new Date(time).toISOString()} title=${this.dateTime(time)}>${this.relative(time)}</time>`;
  }

  /** A translated sentence with a relative time slotted in where the language puts `{time}`. */
  protected withTime(key: TranslationKey, time: number): TemplateResult {
    const marker = "\u0000";
    const [before = "", after = ""] = this.t(key, { time: marker }).split(marker);
    return html`${before}${this.timeTemplate(time)}${after}`;
  }

  /** Size, duration and item count of a run, formatted by Home Assistant. */
  protected runDetails(job: Job): string {
    const parts: string[] = [];
    const states = this.hass?.states ?? {};
    for (const role of ["job_last_size", "job_last_duration"]) {
      const id = job.entities[role];
      if (id && states[id] && !["unknown", "unavailable"].includes(states[id].state)) parts.push(this.formatState(id));
    }
    if (job.itemsDone !== null) parts.push(this.t("common.items", { count: job.itemsDone }));
    return parts.join(this.t("common.separator"));
  }

  protected get language(): string {
    return languageOf(this.hass);
  }

  /** The label for a server status level. */
  protected serverLabel(model: VaultModel): string {
    if (model.online === false) return this.t("server.offline");
    switch (model.level) {
      case "failed":
        return this.t("server.failed");
      case "warning":
        return this.t("server.warning");
      case "running":
        return onlyRestoring(model) ? this.t("server.restoring") : this.t("server.running");
      case "unknown":
        return this.t("server.unknown");
      default:
        return this.t("server.ok");
    }
  }

  /** A job's status label: Home Assistant's translated state where there is one. */
  protected jobLabel(job: { level: Level; entities: Record<string, string> }, level: Level = job.level): string {
    job = { ...job, level };
    if (job.level === "unknown") return this.t("level.unknown");
    if (job.level === "disabled") return this.t("job.disabled");
    if (job.level === "warning" || job.level === "failed" || job.level === "running" || job.level === "ok" || job.level === "idle") {
      const status = job.entities.job_status;
      const stateObj = status ? this.hass?.states[status] : undefined;
      const describesThisLevel = level === "running" || !["running", "restoring"].includes(stateObj?.state ?? "");
      if (stateObj && describesThisLevel && this.hass?.formatEntityState && !["unknown", "unavailable"].includes(stateObj.state)) {
        if (job.level === "warning" && stateObj.state === "completed") return this.t("level.warning");
        return this.hass.formatEntityState(stateObj);
      }
    }
    return this.t(job.level === "ok" ? "job.ok" : `level.${job.level}`);
  }
}
