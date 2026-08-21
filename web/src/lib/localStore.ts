/**
 * localStorage as a React external store.
 *
 * The forecaster's identity key and the salts that open their sealed forecasts
 * live only in this browser. They are read through `useSyncExternalStore`
 * rather than an effect for two reasons: localStorage does not exist during
 * SSR (so the server snapshot must be an explicit "nothing"), and a write from
 * one component has to be visible to every other one immediately — sealing a
 * forecast in the form should update the list in the rail without a reload.
 *
 * Snapshots are cached against the raw string so that repeated reads return an
 * identical reference. Returning a freshly parsed object each call would spin
 * React in an infinite re-render.
 */

import type { Identity, StoredForecast } from "./forecast";

const STORE_KEY = "xence.forecasts.v1";
const ID_KEY = "xence.identity.v1";

const listeners = new Set<() => void>();

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab writing the same keys is a real case: the same person with two
  // windows open should not see two different track records.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORE_KEY || e.key === ID_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function notify() {
  for (const l of listeners) l();
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private browsing, or site data blocked. Treated as "no identity yet",
    // which the UI surfaces as a prompt to create and back one up.
    return null;
  }
}

export function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* nothing we can do; the caller warns the user to export */
  }
  notify();
}

export { STORE_KEY, ID_KEY };

/* --- cached snapshots ------------------------------------------------- */

let idRaw: string | null = null;
let idValue: Identity | null = null;

export function identitySnapshot(): Identity | null {
  const raw = read(ID_KEY);
  if (raw !== idRaw) {
    idRaw = raw;
    try {
      idValue = raw ? (JSON.parse(raw) as Identity) : null;
    } catch {
      idValue = null;
    }
  }
  return idValue;
}

export function identityServerSnapshot(): Identity | null {
  return null;
}

const NO_FORECASTS: StoredForecast[] = [];

let listRaw: string | null = null;
let listValue: StoredForecast[] = NO_FORECASTS;

export function forecastsSnapshot(): StoredForecast[] {
  const raw = read(STORE_KEY);
  if (raw !== listRaw) {
    listRaw = raw;
    try {
      listValue = raw ? (JSON.parse(raw) as StoredForecast[]) : NO_FORECASTS;
    } catch {
      listValue = NO_FORECASTS;
    }
  }
  return listValue;
}

export function forecastsServerSnapshot(): StoredForecast[] {
  return NO_FORECASTS;
}
