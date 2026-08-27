"use client";

import { useEffect, useState } from "react";
import { RpcProvider } from "starknet";
import { RPC_URL } from "@/lib/config";

/**
 * Unix time as the chain sees it. A horizon is compared against the block
 * timestamp, so a browser clock running behind would seal forecasts that are
 * already in the past and revert on execution.
 */
let chainOffset = 0;
let synced = false;

async function syncToChain() {
  try {
    const block = await new RpcProvider({ nodeUrl: RPC_URL }).getBlock("latest");
    const ts = Number(block.timestamp);
    if (Number.isFinite(ts) && ts > 0) {
      chainOffset = ts - Math.floor(Date.now() / 1000);
      synced = true;
    }
  } catch {
    /* keep the local clock rather than blocking the UI */
  }
}

export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    const tick = () => live && setNow(Math.floor(Date.now() / 1000) + chainOffset);

    if (!synced) void syncToChain().then(tick);
    tick();

    const id = setInterval(tick, intervalMs);
    // Re-sync occasionally, and whenever the tab wakes from being hidden.
    const resync = setInterval(() => void syncToChain().then(tick), 5 * 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncToChain().then(tick);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      live = false;
      clearInterval(id);
      clearInterval(resync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}

/** How far the browser clock drifts from the chain, in seconds. */
export function clockSkewSeconds(): number {
  return synced ? chainOffset : 0;
}
