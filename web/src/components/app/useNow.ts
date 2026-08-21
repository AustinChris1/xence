"use client";

import { useEffect, useState } from "react";

/**
 * The current unix time, as a value React is allowed to depend on.
 *
 * Calling `Date.now()` during render is impure: the server renders one value,
 * the client renders another, and every re-render silently changes the answer.
 * For a product whose whole subject is deadlines — is this forecast open, due,
 * or forfeited — that is the difference between a correct badge and a wrong one.
 *
 * Returns `null` until mounted, so callers must handle "we don't know the time
 * yet" rather than rendering a guess the server would disagree with.
 */
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
