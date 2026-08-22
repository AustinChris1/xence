"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";

/**
 * Wallet diagnostics.
 *
 * A wallet that is installed but never appears in the picker is invisible from
 * the app's side: the discovery store simply never emits it. This page dumps
 * every source the store reads from, so the difference between "not installed",
 * "installed but not injecting" and "injecting under an unexpected name" is
 * visible rather than guessed at.
 *
 * Not linked from anywhere. It exists to be pasted into a bug report.
 */
type Row = { source: string; detail: string };

export default function WalletDebugPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const out: Row[] = [];

    // 1. Legacy injection: wallets that write themselves onto window.
    const w = window as unknown as Record<string, unknown>;
    const injected = Object.keys(w).filter(
      (k) => k.toLowerCase().includes("starknet") || k.toLowerCase().includes("ready"),
    );
    out.push({
      source: "window.* keys matching starknet/ready",
      detail: injected.length ? injected.join(", ") : "(none)",
    });

    for (const key of injected) {
      const obj = w[key] as Record<string, unknown> | undefined;
      if (obj && typeof obj === "object") {
        out.push({
          source: `  window.${key}`,
          detail: [
            `id=${String(obj.id ?? "—")}`,
            `name=${String(obj.name ?? "—")}`,
            `version=${String(obj.version ?? "—")}`,
            `has request()=${typeof obj.request === "function"}`,
          ].join("  "),
        });
      }
    }

    // 2. The Wallet Standard registry, which is what the discovery store reads.
    try {
      const evt = new CustomEvent("wallet-standard:app-ready", {
        detail: {
          register: (...wallets: { name?: string; features?: object }[]) => {
            for (const ws of wallets) {
              out.push({
                source: "wallet-standard registry",
                detail: `${ws.name ?? "?"}  features=[${Object.keys(ws.features ?? {}).join(", ")}]`,
              });
            }
            return () => {};
          },
        },
      });
      window.dispatchEvent(evt);
    } catch (e) {
      out.push({
        source: "wallet-standard registry",
        detail: `probe failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    }

    out.push({ source: "userAgent", detail: navigator.userAgent });

    // Collect for a moment before rendering. Wallets answer the app-ready event
    // by calling `register`, and some do it a tick or two later — reading the
    // list synchronously would miss exactly the late-injecting extension this
    // page exists to find.
    const timer = window.setTimeout(() => setRows(out.slice()), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const text = rows.map((r) => `${r.source}\n    ${r.detail}`).join("\n");

  return (
    <>
      <Nav />
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <h1 className="font-display text-3xl text-teal-950">Wallet diagnostics</h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[var(--text-dim)]">
            Everything this page can see about wallets in this browser. If a
            wallet is installed but missing from the picker, the answer is here.
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

          <div className="mt-6 space-y-2">
            {rows.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--edge)] bg-cream-100 p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700">
                  {r.source}
                </p>
                <p className="mt-1.5 break-all font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
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
