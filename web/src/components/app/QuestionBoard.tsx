"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { FEED_GROUPS, FEEDS, formatPrice, type Quote } from "@/lib/pragma";
import {
  METRICS,
  formatMetric,
  probeMetric,
  type Metric,
} from "@/lib/metrics";
import { cn } from "@/lib/cn";

export function QuestionBoard({
  qkind,
  onQkind,
  asset,
  onAsset,
  quotes,
  metricId,
  onMetric,
  metricValues,
  showMetrics,
}: {
  qkind: "price" | "metric";
  onQkind: (k: "price" | "metric") => void;
  asset: string;
  onAsset: (pair: string) => void;
  quotes: Record<string, Quote | null>;
  metricId: string;
  onMetric: (m: Metric) => void;
  metricValues: Record<string, number | null>;
  showMetrics: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--edge)] bg-cream-100 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="flex items-center gap-1.5 border-b border-[var(--edge)] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Open questions
        </span>
        <InfoTip align="left">
          Click a row to load it into the seal. Prices settle on the Pragma
          median. Ecosystem numbers settle by reading an ERC-20 balance at the
          horizon: any token, any holder, including one you paste.
        </InfoTip>
      </div>

      {showMetrics ? (
        <div className="flex gap-1.5 border-b border-[var(--edge)] px-4 py-3">
          <Tab active={qkind === "price"} onClick={() => onQkind("price")}>
            price
          </Tab>
          <Tab active={qkind === "metric"} onClick={() => onQkind("metric")}>
            on-chain
          </Tab>
        </div>
      ) : null}

      {qkind === "price" || !showMetrics ? (
        <PriceList asset={asset} onAsset={onAsset} quotes={quotes} />
      ) : (
        <MetricList
          metricId={metricId}
          onMetric={onMetric}
          values={metricValues}
        />
      )}
    </section>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "btn-spring rounded-xl px-3.5 py-1.5 font-mono text-[12px] font-medium transition-all",
        active
          ? "bg-teal-700 text-cream-100 shadow-[var(--shadow-card)]"
          : "border border-[var(--edge)] bg-cream-50 text-[var(--text-dim)] hover:border-teal-700/40 hover:bg-cream-100",
      )}
    >
      {children}
    </button>
  );
}

function PriceList({
  asset,
  onAsset,
  quotes,
}: {
  asset: string;
  onAsset: (pair: string) => void;
  quotes: Record<string, Quote | null>;
}) {
  return (
    <div className="pb-2">
      {FEED_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-4 pt-3.5 pb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
            {group.label}
          </p>
          <ul className="space-y-0.5 px-1.5">
            {group.pairs.map((pair) => {
              const feed = FEEDS.find((f) => f.pair === pair);
              const quote = quotes[pair];
              const sources = quote?.sources ?? feed?.sources ?? 0;
              const selected = asset === pair;
              return (
                <li key={pair}>
                  <button
                    onClick={() => onAsset(pair)}
                    className={cn(
                      "btn-spring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all",
                      selected
                        ? "bg-teal-700 text-cream-100 shadow-[var(--shadow-card)]"
                        : "hover:bg-cream-200/50",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13.5px] font-medium",
                          selected ? "text-cream-50" : "text-teal-900",
                        )}
                      >
                        {feed?.label ?? pair.split("/")[0]}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          selected ? "text-cream-100/70" : "text-[var(--text-faint)]",
                        )}
                      >
                        {pair}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span
                        className={cn(
                          "tnum block font-mono text-[12.5px] font-medium",
                          selected ? "text-cream-50" : "text-teal-800",
                        )}
                      >
                        {quote ? `$${formatPrice(quote.price)}` : "…"}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9.5px] uppercase tracking-[0.1em]",
                          selected
                            ? "text-cream-100/70"
                            : sources >= 5
                              ? "text-teal-700"
                              : "text-seal-600",
                        )}
                      >
                        {sources ? `${sources} src` : "—"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MetricList({
  metricId,
  onMetric,
  values,
}: {
  metricId: string;
  onMetric: (m: Metric) => void;
  values: Record<string, number | null>;
}) {
  return (
    <div className="pb-3">
      <p className="px-4 pt-3 pb-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Curated
      </p>
      <ul>
        {METRICS.map((m) => {
          const selected = metricId === m.id;
          const value = values[m.id];
          return (
            <li key={m.id}>
              <button
                onClick={() => onMetric(m)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors",
                  selected ? "bg-teal-700 text-cream-100" : "hover:bg-cream-50",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13.5px]",
                      selected ? "text-cream-50" : "text-teal-900",
                    )}
                  >
                    {m.label}
                  </span>
                </span>
                <span
                  className={cn(
                    "tnum shrink-0 font-mono text-[12px]",
                    selected ? "text-cream-100/80" : "text-[var(--text-faint)]",
                  )}
                >
                  {value == null ? "…" : formatMetric(value, m.unit)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <CustomRow selectedId={metricId} onMetric={onMetric} />
    </div>
  );
}

function CustomRow({
  selectedId,
  onMetric,
}: {
  selectedId: string;
  onMetric: (m: Metric) => void;
}) {
  const [token, setToken] = useState("");
  const [holder, setHolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function read() {
    setBusy(true);
    setError(null);
    const result = await probeMetric(token, holder);
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onMetric(result.metric);
  }

  const selected = selectedId.startsWith("custom:");

  return (
    <div className="mx-3 mt-2 rounded-2xl border border-[var(--edge)] bg-cream-50 p-3">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Any balance
      </p>
      <p className="mt-1 text-[11.5px] leading-snug text-[var(--text-dim)]">
        Token and the address that holds it. Settles by reading that balance.
      </p>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="token 0x…"
        spellCheck={false}
        className="btn-spring mt-2 w-full rounded-xl border border-[var(--edge)] bg-cream-100 px-3 py-2 font-mono text-[11.5px] text-teal-900 outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--edge-strong)]"
      />
      <input
        value={holder}
        onChange={(e) => setHolder(e.target.value)}
        placeholder="holder 0x…"
        spellCheck={false}
        className="btn-spring mt-1.5 w-full rounded-xl border border-[var(--edge)] bg-cream-100 px-3 py-2 font-mono text-[11.5px] text-teal-900 outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--edge-strong)]"
      />
      <button
        onClick={read}
        disabled={busy}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-medium transition-colors disabled:opacity-40",
          selected
            ? "bg-teal-700 text-cream-100"
            : "border border-[var(--edge)] bg-cream-100 text-teal-800 hover:border-[var(--edge-strong)]",
        )}
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : null}
        {busy ? "Reading…" : selected ? "Loaded · on the seal" : "Read balance"}
      </button>
      {error ? (
        <p className="mt-2 text-[11.5px] leading-snug text-seal-700">{error}</p>
      ) : null}
    </div>
  );
}
