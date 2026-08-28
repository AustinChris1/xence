"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { WalletAccountV6 } from "starknet";
import {
  connect,
  forgetWallet,
  reconnect,
  rememberWallet,
  shieldedBalance,
  supportsStrk20,
  walletStore,
  type DiscoveredWallet,
} from "@/lib/strk20";
import {
  createIdentity,
  loadIdentity,
  saveIdentity,
  type Identity,
  loadForecasts,
  discardForecast,
  saveForecast,
} from "@/lib/forecast";
import { fetchClaimState } from "@/lib/vault";
import * as store from "@/lib/localStore";

export type WalletState =
  | { status: "idle" }
  | { status: "connecting" }
  | {
      status: "connected";
      account: WalletAccountV6;
      address: string;
      strk20: boolean;
      walletName: string;
    }
  | { status: "error"; message: string };

const NO_WALLETS: readonly DiscoveredWallet[] = [];

/** Injected wallets, as an external store rather than effect-driven state. */
function useDiscoveredWallets(): readonly DiscoveredWallet[] {
  const store = useMemo(() => walletStore(), []);
  const cached = useRef<readonly DiscoveredWallet[]>(NO_WALLETS);

  const subscribe = useCallback((onChange: () => void) => store.subscribe(onChange), [store]);

  const getSnapshot = useCallback(() => {
    const next = store.getWallets();
    const prev = cached.current;
    const same =
      next.length === prev.length && next.every((w, i) => w === prev[i]);
    if (!same) cached.current = next;
    return cached.current;
  }, [store]);

  return useSyncExternalStore(subscribe, getSnapshot, () => NO_WALLETS);
}

export function useXence() {
  const wallets = useDiscoveredWallets();

  /** Which discovered wallets can actually do STRK20. */
  const [capabilities, setCapabilities] = useState<
    Record<string, boolean | undefined>
  >({});
  const probed = useRef<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    for (const w of wallets) {
      if (probed.current.has(w.name)) continue;
      probed.current.add(w.name);
      supportsStrk20(w)
        .then((ok) => {
          if (live) setCapabilities((prev) => ({ ...prev, [w.name]: ok }));
        })
        .catch(() => {
          if (live) setCapabilities((prev) => ({ ...prev, [w.name]: false }));
        });
    }
    return () => {
      live = false;
    };
  }, [wallets]);
  const [wallet, setWallet] = useState<WalletState>({ status: "idle" });
  const [balance, setBalance] = useState<bigint | null>(null);

  // Both are read straight from localStorage through an external store, so a write anywhere.
  const identity = useSyncExternalStore(
    store.subscribe,
    store.identitySnapshot,
    store.identityServerSnapshot,
  );
  const forecasts = useSyncExternalStore(
    store.subscribe,
    store.forecastsSnapshot,
    store.forecastsServerSnapshot,
  );

  const ensureIdentity = useCallback((): Identity => {
    const existing = loadIdentity();
    if (existing) return existing;
    const fresh = createIdentity();
    saveIdentity(fresh);
    return fresh;
  }, []);

  const connectTo = useCallback(async (w: DiscoveredWallet) => {
    setWallet({ status: "connecting" });
    try {
      // Capability first, by version query, so we never ask for balance.
      const strk20 = await supportsStrk20(w);
      const account = await connect(w);
      rememberWallet(w.name);
      setWallet({
        status: "connected",
        account,
        address: account.address,
        strk20,
        walletName: w.name,
      });
    } catch (e) {
      setWallet({
        status: "error",
        message: e instanceof Error ? e.message : "Could not connect",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    forgetWallet();
    setWallet({ status: "idle" });
    setBalance(null);
  }, []);

  // Silent reconnect, so a reload does not look like a logout.
  useEffect(() => {
    if (wallet.status !== "idle" || wallets.length === 0) return;
    let live = true;
    reconnect(wallets).then(async (r) => {
      if (!live || !r) return;
      const strk20 = await supportsStrk20(r.wallet).catch(() => false);
      setWallet({
        status: "connected",
        account: r.account,
        address: r.account.address,
        strk20,
        walletName: r.wallet.name,
      });
    });
    return () => {
      live = false;
    };
  }, [wallets, wallet.status]);

  /** Explicit, user-initiated only. */
  const revealBalance = useCallback(async () => {
    if (wallet.status !== "connected" || !wallet.strk20) return;
    try {
      setBalance(await shieldedBalance(wallet.account));
    } catch {
      setBalance(null);
    }
  }, [wallet]);

  // Writes notify the store themselves, so callers no longer need to refresh.
  const refreshForecasts = useCallback(() => {}, []);

  // The wallet sometimes reports failure on a reveal that landed, so the local
  // list reconciles against the vault instead of trusting the last error.
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current) return;
    const open = loadForecasts().filter((f) => !f.revealedAt);
    if (open.length === 0) return;
    reconciled.current = true;
    void (async () => {
      for (const f of open) {
        try {
          const state = await fetchClaimState(f.commitmentHash);
          if (state === "settled" || state === "forfeited") {
            saveForecast({ ...f, revealedAt: Math.floor(Date.now() / 1000) });
          } else if (
            state === null &&
            Date.now() / 1000 - f.committedAt > 30 * 60
          ) {
            // Sealed locally half an hour ago, never seen by the vault: the
            // submission failed and this card is a ghost.
            discardForecast(f.commitmentHash);
          }
        } catch {
          /* leave it; the reveal button's own preflight still catches it */
        }
      }
    })();
  }, []);

  return {
    wallets,
    capabilities,
    wallet,
    identity,
    balance,
    forecasts,
    connectTo,
    disconnect,
    ensureIdentity,
    revealBalance,
    refreshForecasts,
  };
}
