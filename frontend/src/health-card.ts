import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { HEALTH_CARD_TAG } from "./config";
import { mdiShieldCheckOutline } from "./icons";
import type { Attention, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

const MAX_REASONS = 3;

/** Translate one attention item into a sentence. */
export function attentionText(card: BaseVaultCard, item: Attention): string {
  const t = card.t.bind(card);
  switch (item.kind) {
    case "daemon":
      return t("attention.daemon", { state: item.subject ?? "" });
    case "job_failed":
    case "job_warning":
    case "job_unknown":
    case "storage":
      return t(`attention.${item.kind}`, { subject: item.subject ?? "" });
    case "anomalies":
    case "unprotected":
      return t(`attention.${item.kind}`, { count: item.count ?? 0 });
    default:
      return t(`attention.${item.kind}`);
  }
}

export class VaultHealthCard extends BaseVaultCard {
  protected titleKey = "title.health" as const;
  protected titleIcon = mdiShieldCheckOutline;

  override getCardSize(): number {
    return 2 + Math.min(this.model?.attention.length ?? 0, MAX_REASONS);
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const shown = model.attention.slice(0, MAX_REASONS);
    const hidden = model.attention.length - shown.length;
    return html`<ha-card>
      ${this.renderHeader()}
      <div class="status">
        <span class="status-icon lvl-${model.level}">${this.levelIcon(model.level, 24)}</span>
        <div class="status-text">
          ${this.entityLink(model.entry.entities.vault_status, html`<span class="label">${this.serverLabel(model)}</span>`)}
          <span class="sub">
            ${model.attention.length === 0 ? this.t("attention.none") : nothing}
            ${model.attention.length === 0 && model.version ? this.t("common.separator") : nothing}
            ${model.version ? this.t("common.version", { version: model.version }) : nothing}
          </span>
        </div>
      </div>
      ${shown.length
        ? html`<ul class="list">
            ${shown.map(
              (item) => html`<li>
                ${this.entityLink(
                  item.entityId,
                  html`<span class="reason">${this.levelIcon(item.level, 18)}<span>${attentionText(this, item)}</span></span>`
                )}
              </li>`
            )}
            ${hidden > 0 ? html`<li class="sub">${this.t("common.more", { count: hidden })}</li>` : nothing}
          </ul>`
        : nothing}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: HEALTH_CARD_TAG,
  card: VaultHealthCard,
  nameKey: "card.health.name",
  descriptionKey: "card.health.description",
});
