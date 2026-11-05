import type { HomeAssistant } from "./ha-types";
import type { EntryMap } from "./model";

interface CacheEntry {
  entities: unknown;
  promise: Promise<EntryMap[]>;
  /** When an empty result stops counting: a Vault entry may still be setting up. */
  expires?: number;
}

const EMPTY_RESULT_TTL_MS = 30_000;

/** One request per connection, shared by all cards, refreshed when the entity registry changes. */
const cache = new WeakMap<object, CacheEntry>();

/**
 * Ask the integration which entities belong to which Vault server, job and
 * destination. Cards never parse entity IDs or friendly names, so renamed
 * entities keep working.
 */
export function loadEntityMap(hass: HomeAssistant): Promise<EntryMap[]> {
  const key = hass.connection ?? hass;
  const cached = cache.get(key);
  // hass.entities is replaced whenever the entity registry changes, for
  // example when a job is added, so a new object means a fresh map.
  if (cached && cached.entities === hass.entities && (cached.expires === undefined || Date.now() < cached.expires)) {
    return cached.promise;
  }
  if (!hass.callWS) return Promise.resolve([]);
  const promise = hass
    .callWS<{ entries: EntryMap[] }>({ type: "vault/entity_map" })
    .then((result) => result.entries ?? []);
  const entry: CacheEntry = { entities: hass.entities, promise };
  cache.set(key, entry);
  promise.then(
    (entries) => {
      // A Vault entry retrying setup isn't listed yet and its entities don't
      // change when it recovers, so look again later instead of trusting "none".
      if (entries.length === 0) entry.expires = Date.now() + EMPTY_RESULT_TTL_MS;
    },
    () => {
      if (cache.get(key) === entry) cache.delete(key);
    }
  );
  return promise;
}
