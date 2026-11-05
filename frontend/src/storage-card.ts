import { html, nothing, type TemplateResult } from "lit";
import { BaseVaultCard } from "./dashboard-cards-base";
import { STORAGE_CARD_TAG } from "./config";
import { mdiHarddisk } from "./icons";
import { formatPercent } from "./localize/localize";
import type { Destination, VaultModel } from "./model";
import { registerDashboardCard } from "./register-dashboard-card";

/** The selected server's storage destinations, with health and capacity. */
export class VaultStorageCard extends BaseVaultCard {
  protected titleKey = "title.storage" as const;
  protected titleIcon = mdiHarddisk;

  override getCardSize(): number {
    return 1 + 2 * (this.model?.storage.length ?? 1);
  }

  override getGridOptions() {
    return { columns: 12, rows: "auto" as const, min_columns: 6 };
  }

  private typeLabel(type: string): string {
    const key = `storage.type.${type.toLowerCase()}`;
    const label = this.t(key);
    return label === key ? type.toUpperCase() : label;
  }

  private healthLabel(dest: Destination): string {
    if (dest.health === null) return this.t("storage.health_unknown");
    if (dest.health.toLowerCase() === "ok") return this.t("storage.health_ok");
    return this.formatState(dest.entities.storage_health);
  }

  private renderDestination(dest: Destination): TemplateResult {
    const e = dest.entities;
    const healthLevel = dest.health === null ? "unknown" : dest.health.toLowerCase() === "ok" ? "ok" : "warning";
    const usageLevel = dest.usedPercent === null ? "unknown" : dest.usedPercent >= 90 ? "failed" : dest.usedPercent >= 80 ? "warning" : "ok";
    return html`<li class="row">
      <div class="row-main">
        <span class="row-title">
          ${this.entityLink(e.storage_name ?? e.storage_health, html`<span class="label">${dest.name}</span>`)}
          ${dest.type ? html`<span class="badge">${this.typeLabel(dest.type)}</span>` : nothing}
          ${this.entityLink(e.storage_health, this.levelBadge(healthLevel, this.healthLabel(dest)))}
        </span>
        ${dest.usedPercent !== null
          ? html`<div
                class="meter"
                role="meter"
                aria-label=${this.t("storage.usage", { name: dest.name })}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${Math.round(dest.usedPercent)}
                aria-valuetext=${this.t("storage.used", { percent: formatPercent(this.hass, dest.usedPercent) })}
              >
                <div class="meter-fill lvl-${usageLevel}" style="width: ${dest.usedPercent}%"></div>
              </div>
              <span class="sub">
                ${this.entityLink(e.storage_free_space, this.t("storage.free", { free: this.formatState(e.storage_free_space) }))}
                ${this.t("common.separator")}${this.t("storage.used", { percent: formatPercent(this.hass, dest.usedPercent) })}
              </span>`
          : html`<span class="sub">${this.t("storage.capacity_unknown")}</span>`}
      </div>
    </li>`;
  }

  protected renderCard(model: VaultModel): TemplateResult {
    return html`<ha-card>
      ${this.renderHeader()}
      ${model.storage.length === 0
        ? html`<span class="empty">${this.t("storage.empty")}</span>`
        : html`<ul class="list">${model.storage.map((dest) => this.renderDestination(dest))}</ul>`}
    </ha-card>`;
  }
}

registerDashboardCard({
  tag: STORAGE_CARD_TAG,
  card: VaultStorageCard,
  nameKey: "card.storage.name",
  descriptionKey: "card.storage.description",
});
