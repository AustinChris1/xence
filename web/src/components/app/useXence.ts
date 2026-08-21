"use client";

import { useCallback, useEffect, useState } from "react";
import type { WalletAccountV6 } from "starknet";
import {
  connect,
  shieldedBalance,
  supportsStrk20,
  walletStore,
  type DiscoveredWallet,
} from "@/lib/strk20";
import {
  createIdentity,
  loadForecasts,
  loadIdentity,
  saveIdentity,
  type Identity,
  type StoredForecast,
} from "@/lib/forecast";

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

export function useXence() {
  const [wallets, setWallets] = useState<readonly DiscoveredWallet[]>([]);
  const [wallet, setWallet] = useState<WalletState>({ status: "idle" });
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [forecasts, setForecasts] = useState<StoredForecast[]>([]);

  /**
   * Subscribe rather than scan once: extensions can announce themselves after
   * first paint, and a one-shot read shows an empty wallet list to anyone whose
   * extension was still waking up.
   */
  useEffect(() => {
    const store = walletStore();
    setWallets(store.getWallets());
    const unsubscribe = store.subscribe((next) => setWallets(next));
    setIdentity(loadIdentity());
    setForecasts(loadForecasts());
    return unsubscribe;
  }, []);

  const ensureIdentity = useCallback(() => {
    const existing = loadIdentity();
    if (existing) {
      setIdentity(existing);
      return existing;
    }
    const fresh = createIdentity();
    saveIdentity(fresh);
    setIdentity(fresh);
    return fresh;
  }, []);

  const connectTo = useCallback(async (w: DiscoveredWallet) => {
    setWallet({ status: "connecting" });
    try {
      // Capability first, by version query — before any data call, so we never
      // ask for balance consent from a wallet that cannot do STRK20 anyway.
      const strk20 = await supportsStrk20(w);
      const account = await connect(w);
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
    setWallet({ status: "idle" });
    setBalance(null);
  }, []);

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

  const refreshForecasts = useCallback(() => {
    setForecasts(loadForecasts());
  }, []);

  return {
    wallets,
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
