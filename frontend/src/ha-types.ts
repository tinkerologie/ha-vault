/** The parts of Home Assistant's frontend `hass` object the cards use. */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export type HassEntities = Record<string, HassEntity>;

export interface DeviceRegistryEntry {
  id: string;
  name: string | null;
  name_by_user?: string | null;
  identifiers?: [string, string][];
  configuration_url?: string | null;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  device_id?: string | null;
  platform?: string;
  translation_key?: string;
}

export interface FrontendLocaleData {
  language: string;
  number_format?: string;
  time_format?: string;
  date_format?: string;
  time_zone?: string;
}

export interface HomeAssistant {
  states: HassEntities;
  devices?: Record<string, DeviceRegistryEntry>;
  entities?: Record<string, EntityRegistryDisplayEntry>;
  language?: string;
  locale?: FrontendLocaleData;
  config?: { time_zone?: string };
  connection?: object;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ) => Promise<unknown>;
  callWS?: <T>(msg: Record<string, unknown>) => Promise<T>;
  /** Since HA 2023.9. */
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  /** Since HA 2023.9. */
  formatEntityAttributeValue?: (stateObj: HassEntity, attribute: string, value?: unknown) => string;
}

export function fireEvent(
  node: HTMLElement | Window,
  type: string,
  detail?: unknown,
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): Event {
  const event = new CustomEvent(type, {
    bubbles: options?.bubbles ?? true,
    cancelable: Boolean(options?.cancelable),
    composed: options?.composed ?? true,
    detail,
  });
  node.dispatchEvent(event);
  return event;
}
