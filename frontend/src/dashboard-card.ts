import { html, nothing, type TemplateResult } from "lit";
import { anomaliesList } from "./anomalies-card";
import { BaseVaultCard } from "./dashboard-cards-base";
import { DASHBOARD_CARD_TAG } from "./config";
import { attentionText } from "./health-card";
import { iconTemplate, mdiOpenInNew, mdiShieldCheckOutline } from "./icons";
import { formatNumber } from "./localize/localize";
import { lastBackup, type VaultModel } from "./model";
import { progressTemplate } from "./progress-card";
import { registerDashboardCard } from "./register-dashboard-card";

// The individual cards stay available for anyone who wants the detail.
import "./activity-card";
import "./jobs-card";
import "./last-backup-card";
import "./next-run-card";
import "./protected-card";
import "./rules-card";
import "./storage-card";

const MAX_ATTENTION = 4;
const MAX_ANOMALIES = 3;

/**
 * A compact summary of one Vault server: its status, what needs attention,
 * running backups, and the last and next backup. Details live in the Vault
 * UI and the individual cards.
 */
export class VaultDashboardCard extends BaseVaultCard {
  protected titleKey = "title.health" as const;
  protected titleIcon = mdiShieldCheckOutline;

  override getCardSize(): number {
    const model = this.model;
    if (!model) return 3;
    return (
      3 +
      Math.min(model.attention.length, MAX_ATTENTION) +
      (model.anomalyCount ? Math.min(model.anomalies.length, MAX_ANOMALIES) : 0) +
      model.running.length
    );
  }

  override getGridOptions() {
    return { columns: "full" as const, rows: "auto" as const, min_columns: 6 };
  }

  private serverName(model: VaultModel): string {
    const device = model.entry.device_id ? this.hass?.devices?.[model.entry.device_id] : undefined;
    return this.config.title || device?.name_by_user || device?.name || model.entry.title;
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const attention = model.attention.slice(0, MAX_ATTENTION);
    const hiddenAttention = model.attention.length - attention.length;
    const last = lastBackup(model);
    const url = model.entry.configuration_url;
    const { protected: covered, unprotected } = model.coverage;

    return html`<ha-card>
      <div class="header">
        <h2 class="title">
          ${iconTemplate(this.titleIcon, 20, "icon title-icon")}<span class="title-text">${this.serverName(model)}</span>
        </h2>
        <span class="row-actions">
          ${this.entityLink(model.entry.entities.vault_status, this.levelBadge(model.level, this.serverLabel(model)))}
          ${url
            ? html`<a class="btn" href=${url} target="_blank" rel="noopener noreferrer">
                ${iconTemplate(mdiOpenInNew, 18)}${this.t("common.open_in_vault")}
              </a>`
            : nothing}
        </span>
      </div>

      ${attention.length
        ? html`<ul class="list" aria-label=${this.t("server.warning")}>
            ${attention.map(
              (item) => html`<li>
                ${this.entityLink(
                  item.entityId,
                  html`<span class="reason">${this.levelIcon(item.level, 18)}<span>${attentionText(this, item)}</span></span>`
                )}
              </li>`
            )}
            ${hiddenAttention > 0 ? html`<li class="sub">${this.t("common.more", { count: hiddenAttention })}</li>` : nothing}
          </ul>`
        : html`<span class="sub">${this.t("attention.none")}</span>`}

      ${model.anomalyCount ? anomaliesList(this, model.anomalies, MAX_ANOMALIES) : nothing}

      ${model.running.length
        ? html`<ul class="list">${model.running.map((job) => html`<li class="row">${progressTemplate(this, job)}</li>`)}</ul>`
        : nothing}

      <div class="grid-2">
        <div class="fact">
          <span class="fact-label">${this.t("title.last_backup")}</span>
          ${last
            ? html`${this.entityLink(last.entities.job_last_run, html`<span class="label">${this.timeTemplate(last.lastRun!)}</span>`)}
                <span class="sub">${last.name}${this.t("common.separator")}${this.jobLabel(last, last.outcome)}</span>`
            : html`<span class="sub">${this.t("last_backup.none")}</span>`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t("title.next_run")}</span>
          ${model.nextBackup
            ? html`${this.entityLink(model.entry.entities.next_backup, html`<span class="label">${this.timeTemplate(model.nextBackup.time)}</span>`)}
                ${model.nextBackup.job ? html`<span class="sub">${model.nextBackup.job}</span>` : nothing}`
            : html`<span class="sub">${this.t("next_run.unknown")}</span>`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t("title.protected")}</span>
          ${covered !== null
            ? html`${this.entityLink(
                model.entry.entities.protected_items,
                html`<span class="label">${formatNumber(this.hass, covered)}${unprotected !== null
                  ? html` <span class="muted">${this.t("protected.of_total", { total: covered + unprotected })}</span>`
                  : nothing}</span>`
              )}`
            : html`<span class="sub">${this.t("protected.unknown")}</span>`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t("title.jobs")}</span>
          <span class="label">${this.t("common.jobs", { count: model.jobs.length })}</span>
          ${model.version ? html`<span class="sub">${this.t("common.version", { version: model.version })}</span>` : nothing}
        </div>
      </div>
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: DASHBOARD_CARD_TAG,
  card: VaultDashboardCard,
  nameKey: "card.dashboard.name",
  descriptionKey: "card.dashboard.description",
});
