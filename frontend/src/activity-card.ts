import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { ACTIVITY_CARD_TAG } from "./config";
import { mdiFormatListBulleted } from "./icons";
import { recentRuns, type VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

/** Each job's latest run, newest first, with its real outcome. */
export class VaultActivityCard extends BaseVaultCard {
  protected titleKey = "title.activity" as const;
  protected titleIcon = mdiFormatListBulleted;

  override getCardSize(): number {
    return 1 + 2 * (this.model ? recentRuns(this.model.jobs).length : 1);
  }

  override getGridOptions() {
    return { columns: 12, rows: "auto" as const, min_columns: 6 };
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const runs = recentRuns(model.jobs);
    return html`<ha-card>
      ${this.renderHeader()}
      ${runs.length === 0
        ? html`<span class="empty">${this.t("activity.empty")}</span>`
        : html`<ol class="list">
            ${runs.map((job) => {
              const detail = this.runDetails(job);
              return html`<li class="row">
                <div class="row-main">
                  <span class="row-title">
                    ${this.entityLink(job.entities.job_status, html`<span class="label">${job.name}</span>`)}
                    ${this.levelBadge(job.outcome, this.jobLabel(job, job.outcome))}
                  </span>
                  <span class="sub">
                    ${this.entityLink(job.entities.job_last_run, html`${this.dateTime(job.lastRun!)}`)}
                    ${detail ? html`${this.t("common.separator")}${detail}` : nothing}
                  </span>
                </div>
              </li>`;
            })}
          </ol>`}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: ACTIVITY_CARD_TAG,
  card: VaultActivityCard,
  nameKey: "card.activity.name",
  descriptionKey: "card.activity.description",
});
