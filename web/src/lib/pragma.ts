/** Live Pragma feeds. Verified against mainnet, not copied from a docs page. */

import { RpcProvider, shortString } from "starknet";
import { PRAGMA_ORACLE, RPC_URL } from "./config";

export type Feed = {
  pair: string;
  label: string;
  /** Independent publishers behind the median. Fewer means easier to push. */
  sources: number;
};

/**
 * Live mainnet medians, checked against the oracle the contract settles on.
 * WBTC is omitted, being the same bet as BTC. Thin feeds stay listed with
 * their publisher count, so they can be judged rather than hidden.
 */
export const FEEDS: Feed[] = [
  { pair: "BTC/USD", label: "Bitcoin", sources: 11 },
  { pair: "ETH/USD", label: "Ether", sources: 11 },
  { pair: "USDC/USD", label: "USD Coin", sources: 9 },
  { pair: "STRK/USD", label: "Starknet", sources: 12 },
  { pair: "WSTETH/USD", label: "wstETH", sources: 5 },
  { pair: "XSTRK/USD", label: "xSTRK", sources: 1 },
  { pair: "EKUBO/USD", label: "Ekubo", sources: 2 },
  { pair: "LORDS/USD", label: "Lords", sources: 2 },
  { pair: "NSTR/USD", label: "NSTR", sources: 2 },
];

/** Majors first, then Starknet-native. Same order as FEEDS. */
export const FEED_GROUPS: { label: string; pairs: readonly string[] }[] = [
  { label: "Markets", pairs: ["BTC/USD", "ETH/USD", "USDC/USD"] },
  {
    label: "Starknet",
    pairs: ["STRK/USD", "WSTETH/USD", "XSTRK/USD", "EKUBO/USD", "LORDS/USD", "NSTR/USD"],
  },
];

export type Quote = {
  price: number;
  decimals: number;
  sources: number;
  updated: number;
};

const cache = new Map<string, { at: number; quote: Quote }>();

/** Median price for a pair, straight from the oracle the contract settles on. */
export async function fetchQuote(pair: string): Promise<Quote | null> {
  const hit = cache.get(pair);
  if (hit && Date.now() - hit.at < 30_000) return hit.quote;

  try {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const res = await provider.callContract({
      contractAddress: PRAGMA_ORACLE,
      entrypoint: "get_data_median",
      calldata: ["0", shortString.encodeShortString(pair)],
    });
    const decimals = Number(BigInt(res[1]));
    const quote: Quote = {
      price: Number(BigInt(res[0])) / 10 ** decimals,
      decimals,
      sources: Number(BigInt(res[3])),
      updated: Number(BigInt(res[2])),
    };
    if (quote.sources === 0 || quote.price <= 0) return null;
    cache.set(pair, { at: Date.now(), quote });
    return quote;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[pragma] quote failed for", pair, e);
    }
    return null;
  }
}

/** Parallel quote fetch for the desk catalog. */
export async function fetchQuotes(
  pairs: readonly string[] = FEEDS.map((f) => f.pair),
): Promise<Record<string, Quote | null>> {
  const entries = await Promise.all(
    pairs.map(async (pair) => [pair, await fetchQuote(pair)] as const),
  );
  return Object.fromEntries(entries);
}

/** Sensible tick for a strike input, so BTC does not step in cents. */
export function strikeStep(price: number): number {
  if (price >= 10_000) return 500;
  if (price >= 100) return 10;
  if (price >= 1) return 0.05;
  return 0.001;
}

export function formatPrice(price: number): string {
  const dp = price >= 100 ? 0 : price >= 1 ? 2 : 5;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}
