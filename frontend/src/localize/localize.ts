import type { HomeAssistant } from "../ha-types";
import { en, type TranslationKey } from "./en";

type Catalog = Partial<Record<string, string>>;

/** Add a language here when a translation file exists, e.g. `de: de`. */
const CATALOGS: Record<string, Catalog> = { en };

/** The user's language: their profile setting, then the document, then English. */
export function languageOf(hass?: HomeAssistant): string {
  const documentLanguage = typeof document === "undefined" ? "" : document.documentElement.lang;
  return hass?.locale?.language || hass?.language || documentLanguage || "en";
}

function catalogFor(language: string): Catalog {
  return CATALOGS[language] ?? CATALOGS[language.split("-")[0] ?? "en"] ?? en;
}

function lookup(language: string, key: string): string | undefined {
  return catalogFor(language)[key] ?? (en as Catalog)[key];
}

export type Placeholders = Record<string, string | number>;

/**
 * Translate a card string. A `count` placeholder selects the plural form
 * (`key.one`, `key.other`, ...) with the user's language rules.
 */
export function localize(
  hass: HomeAssistant | undefined,
  key: TranslationKey | string,
  placeholders: Placeholders = {}
): string {
  const language = languageOf(hass);
  let template: string | undefined;
  if (typeof placeholders.count === "number") {
    let category = "other";
    try {
      category = new Intl.PluralRules(language).select(placeholders.count);
    } catch {
      // Unknown language tag: English rules.
      category = placeholders.count === 1 ? "one" : "other";
    }
    template = lookup(language, `${key}.${category}`) ?? lookup(language, `${key}.other`);
  }
  template ??= lookup(language, key) ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = placeholders[name];
    if (value === undefined) return match;
    return typeof value === "number" ? formatNumber(hass, value) : value;
  });
}

/** The locale to format numbers with, following the user's number format setting. */
export function numberLocale(hass?: HomeAssistant): string | undefined {
  const language = languageOf(hass);
  switch (hass?.locale?.number_format) {
    case "comma_decimal":
      return "en-US";
    case "decimal_comma":
      return "de";
    case "space_comma":
      return "fr";
    case "system":
      return undefined;
    default:
      return language;
  }
}

export function formatNumber(hass: HomeAssistant | undefined, value: number, options?: Intl.NumberFormatOptions): string {
  if (hass?.locale?.number_format === "none") return String(value);
  try {
    return new Intl.NumberFormat(numberLocale(hass), options).format(value);
  } catch {
    return String(value);
  }
}

export function formatPercent(hass: HomeAssistant | undefined, percent: number): string {
  if (hass?.locale?.number_format === "none") return `${Math.round(percent)}%`;
  return formatNumber(hass, percent / 100, { style: "percent", maximumFractionDigits: 0 });
}

function timeZone(hass?: HomeAssistant): string | undefined {
  return hass?.locale?.time_zone === "server" ? hass.config?.time_zone : undefined;
}

function hour12(hass?: HomeAssistant): boolean | undefined {
  if (hass?.locale?.time_format === "12") return true;
  if (hass?.locale?.time_format === "24") return false;
  return undefined;
}

/** A date and time in the user's language, time zone and 12/24-hour setting. */
export function formatDateTime(hass: HomeAssistant | undefined, time: number): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: hour12(hass),
    timeZone: timeZone(hass),
  };
  try {
    return new Intl.DateTimeFormat(languageOf(hass), options).format(new Date(time));
  } catch {
    return new Date(time).toLocaleString();
  }
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/** "in 3 hours", "2 days ago" in the user's language. */
export function formatRelative(hass: HomeAssistant | undefined, time: number, now = Date.now()): string {
  const diff = time - now;
  let formatter: Intl.RelativeTimeFormat;
  try {
    formatter = new Intl.RelativeTimeFormat(languageOf(hass), { numeric: "auto" });
  } catch {
    formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  }
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit);
  }
  return formatter.format(0, "minute");
}
