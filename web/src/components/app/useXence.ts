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
} from "@/lib/forecast";
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

/**
 * Injected wallets, as an external store rather than effect-driven state.
 *
 * Extensions announce themselves whenever they finish loading, which can be
 * after first paint — a one-shot read shows an empty list to anyone whose
 * extension was still waking up. `useSyncExternalStore` is the primitive built
 * for exactly this: a mutable source outside React that pushes updates.
 *
 * The snapshot is cached by content because `getWallets()` hands back a fresh
 * array each call, and returning a new reference every time would spin React
 * in an infinite re-render.
 */
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

  /**
   * Which discovered wallets can actually do STRK20.
   *
   * Probed once per wallet, tracked in a ref rather than reading the state we
   * are about to set. Deriving "have I probed this yet?" from `capabilities`
   * meant the check read a stale closure, so a re-render could probe the same
   * wallet again — and since a probe can surface a wallet dialog, repeating it
   * produces a popup the user cannot get rid of.
   *
   * The probe is a supported-versions query: no consent prompt for wallets
   * that implement the Starknet API properly.
   */
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

  // Both are read straight from localStorage through an external store, so a
  // write anywhere in the app is visible everywhere immediately, and the server
  // renders an explicit "nothing" instead of a value it cannot know.
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
      // Capability first, by version query — before any data call, so we never
      // ask for balance consent from a wallet that cannot do STRK20 anyway.
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

  /**
   * Explicit, user-initiated only. Reading a shielded balance triggers a wallet
   * consent prompt, so it never runs on mount.
   */
  const revealBalance = useCallback(async () => {
    if (wallet.status !== "connected" || !wallet.strk20) return;
    try {
      setBalance(await shieldedBalance(wallet.account));
    } catch {
      setBalance(null);
    }
  }, [wallet]);

  // Writes notify the store themselves, so callers no longer need to refresh.
  // Kept as a no-op so call sites read the same either way.
  const refreshForecasts = useCallback(() => {}, []);

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
