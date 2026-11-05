import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { JOBS_CARD_TAG } from "./config";
import { iconTemplate, mdiBriefcaseOutline, mdiClose, mdiOpenInNew, mdiPlay } from "./icons";
import type { Job, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

type RunState = "confirm" | "starting" | "started";

interface ConfirmationDialogParams {
  title: string;
  text: string;
  confirmText: string;
  dismissText: string;
}

interface CardHelpers {
  showConfirmationDialog?: (element: HTMLElement, params: ConfirmationDialogParams) => Promise<boolean>;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
  }
}

const STARTED_MESSAGE_MS = 4000;

/** Home Assistant's confirmation dialog, when the card helpers provide it. */
async function confirmationDialog(): Promise<CardHelpers["showConfirmationDialog"]> {
  try {
    const helpers = await window.loadCardHelpers?.();
    return helpers?.showConfirmationDialog;
  } catch {
    return undefined;
  }
}

/**
 * Backup jobs with their status and schedule.
 *
 * Run backup always asks first: a backup can stop containers or VMs, and the
 * integration can't tell which jobs do. Home Assistant's own confirmation
 * dialog is used when available, else the row asks inline.
 */
export class VaultJobsCard extends BaseVaultCard {
  protected titleKey = "title.jobs" as const;
  protected titleIcon = mdiBriefcaseOutline;

  static override properties = {
    ...BaseVaultCard.properties,
    _run: { state: true },
    _errors: { state: true },
  };

  declare _run: Map<number, RunState>;
  declare _errors: Map<number, string>;

  constructor() {
    super();
    this._run = new Map();
    this._errors = new Map();
  }

  override getCardSize(): number {
    return 1 + 2 * (this.model?.jobs.length ?? 1);
  }

  override getGridOptions() {
    return { columns: 12, rows: "auto" as const, min_columns: 6 };
  }

  private setRun(job: Job, state: RunState | undefined): void {
    const next = new Map(this._run);
    if (state) next.set(job.id, state);
    else next.delete(job.id);
    this._run = next;
  }

  private setError(job: Job, message: string | undefined): void {
    const next = new Map(this._errors);
    if (message) next.set(job.id, message);
    else next.delete(job.id);
    this._errors = next;
  }

  private async onRunClick(job: Job): Promise<void> {
    if (this._run.get(job.id) === "starting") return;
    this.setError(job, undefined);
    const dialog = await confirmationDialog();
    if (!dialog) {
      this.setRun(job, "confirm");
      return;
    }
    const confirmed = await dialog(this, {
      title: this.t("jobs.confirm_title", { job: job.name }),
      text: this.t("jobs.confirm_text", { job: job.name }),
      confirmText: this.t("jobs.confirm_ok"),
      dismissText: this.t("jobs.confirm_cancel"),
    });
    if (confirmed) await this.runBackup(job);
  }

  private async runBackup(job: Job): Promise<void> {
    if (!this.hass) return;
    this.setRun(job, "starting");
    try {
      const button = job.entities.run_backup;
      if (button) {
        await this.hass.callService("button", "press", { entity_id: button });
      } else {
        await this.hass.callService("vault", "run_backup", { job_id: job.id });
      }
      this.setRun(job, "started");
      window.setTimeout(() => {
        if (this._run.get(job.id) === "started") this.setRun(job, undefined);
      }, STARTED_MESSAGE_MS);
    } catch (err) {
      console.error(`Failed to start Vault job ${job.name}:`, err);
      this.setRun(job, undefined);
      const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
      this.setError(job, this.t("jobs.run_failed", { job: job.name, error: message }));
    }
  }

  private jobMeta(job: Job): TemplateResult {
    const parts: (TemplateResult | string)[] = [];
    // A running job has no completed run to show yet; "Never run" would be wrong.
    if (job.lastRun !== null) parts.push(this.withTime("jobs.last_run", job.lastRun));
    else if (!job.running) parts.push(this.t("jobs.never_run"));
    // The badge already says Disabled unless a problem outranks it.
    if (job.enabled === false) {
      if (job.level !== "disabled") parts.push(this.t("job.disabled"));
    }
    else if (job.nextRun !== null) parts.push(this.withTime("jobs.next_run", job.nextRun));
    else if (job.enabled === true) parts.push(this.t("jobs.not_scheduled"));
    else parts.push(this.t("job.enabled_unknown"));
    if (job.restorePoints !== null) parts.push(this.t("jobs.restore_points", { count: job.restorePoints }));
    return html`${parts.map((part, i) => html`${i ? this.t("common.separator") : nothing}${part}`)}`;
  }

  private renderRunButton(job: Job): TemplateResult {
    const state = this._run.get(job.id);
    const busy = state === "starting" || job.running;
    const label = job.running
      ? this.t(job.restoring ? "progress.restoring" : "level.running")
      : state === "starting"
        ? this.t("jobs.starting")
        : state === "started"
          ? this.t("jobs.started")
          : this.t("jobs.run");
    return html`<button
      type="button"
      class="btn"
      aria-label=${state === "starting" || state === "started" || job.running ? label : this.t("jobs.run_label", { job: job.name })}
      aria-disabled=${busy ? "true" : "false"}
      @click=${() => (busy ? undefined : this.onRunClick(job))}
    >
      ${iconTemplate(mdiPlay, 18)}${label}
    </button>`;
  }

  private renderJob(job: Job): TemplateResult {
    const error = this._errors.get(job.id);
    const confirming = this._run.get(job.id) === "confirm";
    return html`<li class="row" style="flex-direction: column; align-items: stretch;">
      <div class="row" style="padding: 0; border: none; gap: 12px;">
        <div class="row-main">
          <span class="row-title">
            ${this.entityLink(job.entities.job_status, html`<span class="label">${job.name}</span>`)}
            ${this.levelBadge(job.level, this.jobLabel(job))}
          </span>
          <span class="sub">${this.jobMeta(job)}</span>
        </div>
        <div class="row-actions">${this.renderRunButton(job)}</div>
      </div>
      ${confirming
        ? html`<div class="confirm" role="group" aria-label=${this.t("jobs.confirm_title", { job: job.name })}>
            <span class="label">${this.t("jobs.confirm_title", { job: job.name })}</span>
            <span class="sub">${this.t("jobs.confirm_text", { job: job.name })}</span>
            <div class="row-actions">
              <button type="button" class="btn primary" @click=${() => this.runBackup(job)}>${this.t("jobs.confirm_ok")}</button>
              <button type="button" class="btn" @click=${() => this.setRun(job, undefined)}>${this.t("jobs.confirm_cancel")}</button>
            </div>
          </div>`
        : nothing}
      ${error
        ? html`<div class="alert" role="alert">
            <span class="alert-text">${error}</span>
            <button type="button" aria-label=${this.t("common.dismiss")} @click=${() => this.setError(job, undefined)}>
              ${iconTemplate(mdiClose, 18)}
            </button>
          </div>`
        : nothing}
    </li>`;
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const url = model.entry.configuration_url;
    return html`<ha-card>
      ${this.renderHeader(
        url
          ? html`<a class="btn" href=${url} target="_blank" rel="noopener noreferrer">
              ${iconTemplate(mdiOpenInNew, 18)}${this.t("common.open_in_vault")}
            </a>`
          : nothing
      )}
      ${model.jobs.length === 0
        ? html`<span class="empty">${this.t("jobs.empty")}</span>`
        : html`<ul class="list">${model.jobs.map((job) => this.renderJob(job))}</ul>`}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: JOBS_CARD_TAG,
  card: VaultJobsCard,
  nameKey: "card.jobs.name",
  descriptionKey: "card.jobs.description",
});
