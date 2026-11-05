import { html, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { NEXT_RUN_CARD_TAG } from "./config";
import { mdiCalendarClock } from "./icons";
import { onlyRestoring, type VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

export class VaultNextRunCard extends BaseVaultCard {
  protected titleKey = "title.next_run" as const;
  protected titleIcon = mdiCalendarClock;

  protected renderCard(model: VaultModel): TemplateResult {
    const e = model.entry.entities;
    const enabled = model.jobs.filter((job) => job.enabled === true).length;
    const jobs = this.t("common.jobs", { count: model.jobs.length });
    const running = model.running[0]?.name ?? model.activeJob;
    const restoring = onlyRestoring(model);

    let value: TemplateResult | string;
    let detail: string;
    if (running) {
      value = this.t(restoring ? "next_run.restoring" : "next_run.running");
      detail = running;
    } else if (model.nextBackup) {
      value = this.timeTemplate(model.nextBackup.time);
      detail = `${model.nextBackup.job ?? ""}${model.nextBackup.job ? this.t("common.separator") : ""}${this.dateTime(model.nextBackup.time)}`;
    } else if (this.hass?.states[e.next_backup ?? ""]?.state === "unknown" && enabled === 0) {
      value = this.t("next_run.none");
      detail = "";
    } else {
      value = this.t("next_run.unknown");
      detail = "";
    }

    return html`<ha-card>
      ${this.renderHeader()}
      ${this.entityLink(running ? e.runner_current_job_id : e.next_backup, html`<span class="value">${value}</span>`)}
      ${detail ? html`<span class="label">${detail}</span>` : ""}
      <span class="sub">${this.t("next_run.jobs_enabled", { jobs, enabled })}</span>
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: NEXT_RUN_CARD_TAG,
  card: VaultNextRunCard,
  nameKey: "card.next_run.name",
  descriptionKey: "card.next_run.description",
});
