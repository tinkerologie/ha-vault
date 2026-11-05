import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { LAST_BACKUP_CARD_TAG } from "./config";
import { mdiHistory } from "./icons";
import { lastBackup, type VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

export class VaultLastBackupCard extends BaseVaultCard {
  protected titleKey = "title.last_backup" as const;
  protected titleIcon = mdiHistory;

  protected renderCard(model: VaultModel): TemplateResult {
    const job = lastBackup(model);
    if (!job) {
      return html`<ha-card>${this.renderHeader()}<span class="empty">${this.t("last_backup.none")}</span></ha-card>`;
    }
    return html`<ha-card>
      ${this.renderHeader(this.levelBadge(job.outcome, this.jobLabel(job, job.outcome)))}
      ${this.entityLink(job.entities.job_last_run, html`<span class="value">${this.timeTemplate(job.lastRun!)}</span>`)}
      ${this.entityLink(job.entities.job_status, html`<span class="label">${job.name}</span>`)}
      ${this.runDetails(job) ? html`<span class="sub">${this.runDetails(job)}</span>` : nothing}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: LAST_BACKUP_CARD_TAG,
  card: VaultLastBackupCard,
  nameKey: "card.last_backup.name",
  descriptionKey: "card.last_backup.description",
});
