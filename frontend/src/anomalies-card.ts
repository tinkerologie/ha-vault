import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { ANOMALIES_CARD_TAG } from "./config";
import type { HomeAssistant } from "./ha-types";
import { mdiShieldAlertOutline } from "./icons";
import type { Anomaly, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

const DEFAULT_MAX_ITEMS = 5;

/** A translated severity; unknown severities are shown as Vault sends them. */
function severityLabel(card: BaseVaultCard, severity: string): string {
  const key = `anomalies.severity.${severity}`;
  const label = card.t(key);
  return label === key ? severity : label;
}

/** The open anomalies list, shared with the summary card. */
export function anomaliesList(card: BaseVaultCard, anomalies: Anomaly[], maxItems: number): TemplateResult {
  const shown = anomalies.slice(0, Math.max(1, maxItems));
  const hidden = anomalies.length - shown.length;
  return html`<ul class="list">
    ${shown.map(
      (a) => html`<li class="row">
        <div class="row-main">
          <span class="row-title">
            <span class="label">${a.summary || a.detector}</span>
            <span class="badge lvl-${a.severity === "critical" ? "failed" : "warning"}">${severityLabel(card, a.severity)}</span>
          </span>
          <span class="sub">${a.job ? card.t("anomalies.scope", { job: a.job }) : card.t("anomalies.system")}</span>
        </div>
      </li>`
    )}
    ${hidden > 0 ? html`<li class="sub">${card.t("common.more", { count: hidden })}</li>` : nothing}
  </ul>`;
}

export class VaultAnomaliesCard extends BaseVaultCard {
  protected titleKey = "title.anomalies" as const;
  protected titleIcon = mdiShieldAlertOutline;

  protected static override extraFormSchema() {
    return [{ name: "max_items", selector: { number: { min: 1, max: 20, mode: "box" } } }];
  }

  override getCardSize(): number {
    return 2 + Math.min(this.model?.anomalies.length ?? 0, this.maxItems);
  }

  override getGridOptions() {
    return { columns: 12, rows: "auto" as const, min_columns: 6 };
  }

  private get maxItems(): number {
    const value = Number(this.config.max_items);
    return Number.isInteger(value) && value > 0 ? value : DEFAULT_MAX_ITEMS;
  }

  protected renderCard(model: VaultModel): TemplateResult {
    const count = model.anomalyCount;
    const level = count === null ? "unknown" : count === 0 ? "ok" : model.anomalies.some((a) => a.severity === "critical") ? "failed" : "warning";
    const badge = count === null ? this.t("level.unknown") : count === 0 ? this.t("anomalies.none") : this.t("attention.anomalies", { count });
    return html`<ha-card>
      ${this.renderHeader(this.entityLink(model.entry.entities.open_anomalies, this.levelBadge(level, badge)))}
      ${count ? anomaliesList(this, model.anomalies, this.maxItems) : nothing}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: ANOMALIES_CARD_TAG,
  card: VaultAnomaliesCard,
  nameKey: "card.anomalies.name",
  descriptionKey: "card.anomalies.description",
  // Offer this card in the picker for a Vault server's open anomalies sensor.
  getEntitySuggestion: (hass: HomeAssistant, entityId: string) => {
    const entry = hass.entities?.[entityId];
    if (entry?.platform !== "vault" || entry.translation_key !== "open_anomalies") return null;
    return { config: { type: `custom:${ANOMALIES_CARD_TAG}`, ...(entry.device_id ? { server: entry.device_id } : {}) } };
  },
});
