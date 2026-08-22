"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Nav } from "@/components/site/Nav";
import { walletStore } from "@/lib/strk20";

/**
 * Wallet diagnostics.
 *
 * The authoritative source here is the same discovery store the app uses. An
 * earlier version of this page dispatched its own wallet-standard probe and
 * reported a different list to the picker — which made it worse than useless,
 * because the two disagreeing is exactly the situation it was meant to explain.
 *
 * Not linked from anywhere. It exists to be pasted into a bug report.
 */
type Row = { source: string; detail: string };

export default function WalletDebugPage() {
  const store = useMemo(() => walletStore(), []);
  const [raw, setRaw] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);

  // Read the real store through useSyncExternalStore — the primitive built for
  // exactly this, and the same one the picker uses, so the two cannot drift.
  // The snapshot is cached by content because getWallets() returns a fresh
  // array each call, and a new reference every render loops forever.
  const cached = useRef<string[]>([]);
  const subscribe = useCallback(
    (onChange: () => void) => store.subscribe(onChange),
    [store],
  );
  const getSnapshot = useCallback(() => {
    const next = store.getWallets().map((w) => {
      const features = Object.keys(
        (w as unknown as { features?: object }).features ?? {},
      );
      const starknet = features.filter((f) => f.startsWith("starknet:"));
      return `${w.name} — starknet features: [${starknet.join(", ") || "NONE"}]`;
    });
    const prev = cached.current;
    const same =
      next.length === prev.length && next.every((v, i) => v === prev[i]);
    if (!same) cached.current = next;
    return cached.current;
  }, [store]);
  const storeWallets = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => cached.current,
  );

  // Everything the extension might have written directly onto the page.
  useEffect(() => {
    const collect = () => {
      const w = window as unknown as Record<string, unknown>;
      const keys = Object.keys(w).filter((k) => {
        const s = k.toLowerCase();
        return (
          s.includes("starknet") ||
          s.includes("ready") ||
          s.includes("argent") ||
          s.includes("braavos")
        );
      });
      const out: Row[] = [
        {
          source: "injected window.* keys",
          detail: keys.length ? keys.join(", ") : "(none)",
        },
      ];
      for (const key of keys) {
        const obj = w[key] as Record<string, unknown> | undefined;
        if (obj && typeof obj === "object") {
          out.push({
            source: `window.${key}`,
            detail: `id=${String(obj.id ?? "—")} name=${String(obj.name ?? "—")} version=${String(obj.version ?? "—")} request()=${typeof obj.request === "function"}`,
          });
        }
      }
      out.push({ source: "page origin", detail: window.location.origin });
      out.push({ source: "userAgent", detail: navigator.userAgent });
      return out;
    };
    // Re-sample: an extension whose content script starts late will not be on
    // the page at first paint.
    const timers = [200, 1500, 4000].map((ms) =>
      window.setTimeout(() => setRaw(collect()), ms),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const text = [
    "== discovery store (what the picker uses) ==",
    ...(storeWallets.length ? storeWallets : ["(store returned no wallets)"]),
    "",
    "== raw page state ==",
    ...raw.map((r) => `${r.source}: ${r.detail}`),
  ].join("\n");

  return (
    <>
      <Nav />
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <h1 className="font-display text-3xl text-teal-950">Wallet diagnostics</h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[var(--text-dim)]">
            The first block is the discovery store the wallet picker itself
            reads, so it cannot disagree with what you see on{" "}
            <span className="font-mono text-[13px]">/app</span>. The second is
            whatever the extension wrote onto the page directly.
          </p>

          <button
            onClick={() => {
              void navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="mt-6 rounded-full bg-teal-700 px-5 py-2.5 text-[13px] font-medium text-cream-100 transition-colors hover:bg-teal-600"
          >
            {copied ? "Copied" : "Copy all"}
          </button>

          <h2 className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-teal-700">
            Discovery store — what the picker uses
          </h2>
          <div className="mt-3 space-y-2">
            {storeWallets.length === 0 ? (
              <p className="rounded-xl border border-seal-500/40 bg-seal-500/10 p-4 font-mono text-[12px] text-seal-700">
                Store returned no wallets. No extension is exposing the Starknet
                wallet interface on this page.
              </p>
            ) : (
              storeWallets.map((s, i) => (
                <p
                  key={i}
                  className="break-all rounded-xl border border-[var(--edge)] bg-cream-100 p-3 font-mono text-[12px] text-[var(--text-dim)]"
                >
                  {s}
                </p>
              ))
            )}
          </div>

          <h2 className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-teal-700">
            Raw page state
          </h2>
          <div className="mt-3 space-y-2">
            {raw.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--edge)] bg-cream-100 p-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-teal-700">
                  {r.source}
                </p>
                <p className="mt-1 break-all font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
