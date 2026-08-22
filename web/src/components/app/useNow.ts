"use client";

import { useEffect, useState } from "react";

/** The current unix time, as a value React is allowed to depend on. */
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
