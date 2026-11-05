import { expect, test } from "@playwright/test";
import { formatNumber, formatRelative, localize } from "../../src/localize/localize";
import type { HomeAssistant } from "../../src/ha-types";

function hass(locale: Partial<NonNullable<HomeAssistant["locale"]>>): HomeAssistant {
  return {
    states: {},
    callService: async () => undefined,
    locale: { language: "en", ...locale },
  };
}

test("plural forms follow the language rules", () => {
  expect(localize(hass({}), "common.items", { count: 1 })).toBe("1 item");
  expect(localize(hass({}), "common.items", { count: 0 })).toBe("0 items");
  expect(localize(hass({}), "common.items", { count: 12 })).toBe("12 items");
});

test("unknown languages fall back to English strings", () => {
  expect(localize(hass({ language: "xx" }), "title.jobs")).toBe("Backup jobs");
  expect(localize(hass({ language: "de-CH" }), "jobs.run")).toBe("Run backup");
});

test("numbers follow the number format setting", () => {
  expect(formatNumber(hass({ number_format: "comma_decimal" }), 1234.5)).toBe("1,234.5");
  expect(formatNumber(hass({ number_format: "decimal_comma" }), 1234.5)).toBe("1.234,5");
  expect(formatNumber(hass({ number_format: "none" }), 1234.5)).toBe("1234.5");
  expect(localize(hass({ number_format: "decimal_comma" }), "common.items", { count: 1500 })).toBe("1.500 items");
});

test("relative times use the user's language", () => {
  const now = Date.UTC(2026, 10, 5, 12);
  expect(formatRelative(hass({}), now + 3 * 3_600_000, now)).toBe("in 3 hours");
  expect(formatRelative(hass({}), now - 2 * 86_400_000, now)).toBe("2 days ago");
  expect(formatRelative(hass({ language: "de" }), now - 86_400_000, now)).toBe("gestern");
});

test("percentages keep their scale when number formatting is off", async () => {
  const { formatPercent } = await import("../../src/localize/localize");
  expect(formatPercent(hass({ number_format: "none" }), 42)).toBe("42%");
  expect(formatPercent(hass({}), 42)).toBe("42%");
});
