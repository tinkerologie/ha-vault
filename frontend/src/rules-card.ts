import { html, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { RULES_CARD_TAG } from "./config";
import { mdiFileDocumentCheckOutline } from "./icons";
import type { Level, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

interface Criterion {
  label: string;
  detail: string;
  met: boolean | null;
}

/**
 * The 3-2-1 rule, checked against destinations that enabled jobs have
 * actually backed up to, not every configured destination. Vault can't tell
 * where a destination is, so the card says what it counts.
 */
export class VaultRulesCard extends BaseVaultCard {
  protected titleKey = "title.rules" as const;
  protected titleIcon = mdiFileDocumentCheckOutline;

  override getGridOptions() {
    return { columns: 12, rows: "auto" as const, min_columns: 6 };
  }

  override getCardSize(): number {
    return 3;
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const { destinations, mediaTypes, remote } = model.rules;
    const criteria: Criterion[] = [
      {
        label: this.t("rules.copies"),
        detail: destinations === null ? this.t("rules.unknown") : this.t("rules.copies_detail", { count: destinations }),
        met: destinations === null ? null : destinations >= 3,
      },
      {
        label: this.t("rules.media"),
        detail: mediaTypes === null ? this.t("rules.unknown") : this.t("rules.media_detail", { count: mediaTypes }),
        met: mediaTypes === null ? null : mediaTypes >= 2,
      },
      {
        label: this.t("rules.offsite"),
        detail: remote === null ? this.t("rules.unknown") : remote > 0 ? this.t("rules.offsite_detail_yes") : this.t("rules.offsite_detail_no"),
        met: remote === null ? null : remote > 0,
      },
    ];
    const anyUnknown = criteria.some((c) => c.met === null);
    const allMet = criteria.every((c) => c.met === true);
    const level: Level = anyUnknown ? "unknown" : allMet ? "ok" : "warning";
    // Destinations meeting the rule doesn't prove every item has three copies,
    // or that a remote destination is off site, so never claim more than "likely".
    const badge = anyUnknown ? this.t("rules.unknown") : allMet ? this.t("rules.likely_met") : this.t("rules.not_met");
    const levelOf = (met: boolean | null): Level => (met === null ? "unknown" : met ? "ok" : "failed");

    return html`<ha-card>
      ${this.renderHeader(this.entityLink(model.entry.entities.destinations_in_use, this.levelBadge(level, badge)))}
      <ul class="grid-3 list">
        ${criteria.map(
          (c) => html`<li class="row">
            <span class="status-icon lvl-${levelOf(c.met)}" style="width: 32px; height: 32px;">${this.levelIcon(levelOf(c.met), 18)}</span>
            <div class="row-main">
              <span class="label">${c.label}</span>
              <span class="sub">
                <span class="visually-hidden">${c.met === null ? this.t("rules.unknown") : c.met ? this.t("rules.met") : this.t("rules.not_met")}:</span>
                ${c.detail}
              </span>
            </div>
          </li>`
        )}
      </ul>
      <span class="sub">${this.t("rules.footnote")}</span>
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: RULES_CARD_TAG,
  card: VaultRulesCard,
  nameKey: "card.rules.name",
  descriptionKey: "card.rules.description",
});
