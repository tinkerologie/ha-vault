import { DOCUMENTATION_URL } from "./config";
import { defineOnce } from "./define";
import type { HomeAssistant } from "./ha-types";
import type { TranslationKey } from "./localize/en";
import { localize } from "./localize/localize";

interface EntitySuggestion {
  config: Record<string, unknown>;
}

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
  getEntitySuggestion?: (hass: HomeAssistant, entityId: string) => EntitySuggestion | null;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}

interface DashboardCardRegistration {
  tag: string;
  card: CustomElementConstructor;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Offer the card in the picker for a matching entity (Home Assistant 2026.6+). */
  getEntitySuggestion?: CustomCardEntry["getEntitySuggestion"];
}

export function registerDashboardCard(registration: DashboardCardRegistration): void {
  defineOnce(registration.tag, registration.card);

  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === registration.tag)) {
    window.customCards.push({
      type: registration.tag,
      name: localize(undefined, registration.nameKey),
      description: localize(undefined, registration.descriptionKey),
      // The cards render with live data in the picker.
      preview: true,
      documentationURL: DOCUMENTATION_URL,
      ...(registration.getEntitySuggestion ? { getEntitySuggestion: registration.getEntitySuggestion } : {}),
    });
  }
}
