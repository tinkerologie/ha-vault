import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { PROTECTED_CARD_TAG } from "./config";
import { mdiShieldOutline } from "./icons";
import { formatNumber, formatPercent } from "./localize/localize";
import type { Level, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

/**
 * Items Vault has backed up, out of every container, VM and folder it can
 * see, as counted by Vault itself. Items no job covers count as unprotected.
 */
export class VaultProtectedCard extends BaseVaultCard {
  protected titleKey = "title.protected" as const;
  protected titleIcon = mdiShieldOutline;

  protected renderCard(model: VaultModel): TemplateResult {
    const { protected: covered, unprotected, pending } = model.coverage;
    const e = model.entry.entities;
    const total = covered !== null && unprotected !== null ? covered + unprotected : null;
    const percent = total ? (covered! / total) * 100 : null;
    const level: Level =
      covered === null ? "unknown" : unprotected === null ? "unknown" : unprotected > 0 ? "warning" : "ok";

    let summary: string;
    if (covered === null) summary = this.t("protected.unknown");
    else if (unprotected === null) summary = this.t("protected.total_unknown");
    else if (unprotected === 0) summary = this.t("protected.all");
    else summary = this.t("protected.unprotected", { count: unprotected });

    return html`<ha-card>
      ${this.renderHeader(level === "unknown" ? nothing : this.levelBadge(level, level === "ok" ? this.t("level.ok") : this.t("level.warning")))}
      ${this.entityLink(
        e.protected_items,
        html`<span class="value">${covered === null ? "—" : formatNumber(this.hass, covered)}
          ${total !== null ? html`<small>${this.t("protected.of_total", { total })}</small>` : nothing}</span>`
      )}
      ${percent !== null
        ? html`<div
            class="meter"
            role="meter"
            aria-label=${this.t("protected.meter")}
            aria-valuemin="0"
            aria-valuemax=${total!}
            aria-valuenow=${covered!}
            aria-valuetext=${`${formatNumber(this.hass, covered!)} / ${formatNumber(this.hass, total!)} (${formatPercent(this.hass, percent)})`}
          >
            <div class="meter-fill lvl-${level}" style="width: ${percent}%"></div>
          </div>`
        : nothing}
      ${this.entityLink(
        unprotected ? e.unprotected_items : undefined,
        html`<span class="sub">${summary}${pending
          ? html`${this.t("common.separator")}${this.t("protected.pending", { count: pending })}`
          : nothing}</span>`
      )}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: PROTECTED_CARD_TAG,
  card: VaultProtectedCard,
  nameKey: "card.protected.name",
  descriptionKey: "card.protected.description",
});
