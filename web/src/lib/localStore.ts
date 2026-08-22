/** localStorage as a React external store. */

import type { Identity, StoredForecast } from "./forecast";

const STORE_KEY = "xence.forecasts.v1";
const ID_KEY = "xence.identity.v1";

const listeners = new Set<() => void>();

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab writing the same keys is a real case: the same person with two windows open.
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
    // Private browsing, or site data blocked.
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

/* cached snapshots */

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
