import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { PROGRESS_CARD_TAG } from "./config";
import { mdiSync } from "./icons";
import { formatPercent } from "./localize/localize";
import { onlyRestoring, type Job, type VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

/** A labelled progress bar for one running job; indeterminate when Vault hasn't reported progress. */
export function progressTemplate(card: BaseVaultCard, job: Job): TemplateResult {
  const hass = card.hass;
  const known = job.progress !== null && job.progress > 0;
  const percent = known ? Math.min(100, job.progress!) : null;
  return html`<div class="row-main">
    <span class="row-title">
      ${card.entityLink(job.entities.job_progress, html`<span class="label">${job.name}</span>`)}
      <span class="badge lvl-running">
        ${card.t(job.restoring ? "progress.restoring" : "progress.backing_up")}${percent !== null
          ? html`${card.t("common.separator")}${formatPercent(hass, percent)}`
          : nothing}
      </span>
    </span>
    <div
      class="meter"
      role="progressbar"
      aria-label=${card.t(job.restoring ? "progress.restore_label" : "progress.label", { job: job.name })}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow=${percent ?? nothing}
    >
      <!-- Show a sliver of the stripes while progress is unknown or 0. -->
      <div class="meter-fill lvl-running" style="width: ${Math.max(5, percent ?? 0)}%"></div>
    </div>
  </div>`;
}

export class VaultProgressCard extends BaseVaultCard {
  protected get titleKey() {
    return this.model && onlyRestoring(this.model) ? ("title.restore_progress" as const) : ("title.progress" as const);
  }
  protected titleIcon = mdiSync;

  override getCardSize(): number {
    return 2 + (this.model?.running.length ?? 0);
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const queueId = model.entry.entities.runner_queue_length;
    const queued = queueId && this.hass?.states[queueId] ? Number(this.hass.states[queueId].state) : 0;
    if (model.running.length === 0) {
      return html`<ha-card>
        ${this.renderHeader()}
        <span class="sub">
          ${this.t("progress.idle")}${model.nextBackup
            ? html`${this.t("common.separator")}${this.t("progress.next", { time: this.relative(model.nextBackup.time) })}`
            : nothing}
        </span>
      </ha-card>`;
    }
    return html`<ha-card>
      ${this.renderHeader(
        this.levelBadge("running", this.t(onlyRestoring(model) ? "server.restoring" : "server.running"))
      )}
      <ul class="list">
        ${model.running.map(
          (job) => html`<li class="row">${progressTemplate(this, job)}</li>`
        )}
      </ul>
      ${queued > 0 ? html`<span class="sub">${this.t("progress.queue", { count: queued })}</span>` : nothing}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: PROGRESS_CARD_TAG,
  card: VaultProgressCard,
  nameKey: "card.progress.name",
  descriptionKey: "card.progress.description",
});
