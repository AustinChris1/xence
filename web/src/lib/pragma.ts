/** Live Pragma feeds. Verified against mainnet, not copied from a docs page. */

import { RpcProvider, shortString } from "starknet";
import { PRAGMA_ORACLE, RPC_URL } from "./config";

/**
 * What kind of question an asset can sensibly carry.
 *
 * A percentage move only means something for an asset that moves. Asking
 * whether USDC will be up 5% is not a forecast, it is a category error — the
 * only interesting question about a stablecoin is whether it breaks.
 */
export type FeedKind = "volatile" | "peg";

export type Feed = {
  pair: string;
  label: string;
  kind: FeedKind;
  /** Independent publishers behind the median. Fewer means easier to push. */
  sources: number;
};

/**
 * Deliberately short. Pragma publishes more pairs than this, but WBTC, wstETH
 * and BTC/EUR are the same bet as BTC or ETH wearing a different label, and a
 * menu that offers the same forecast four times is noise, not choice.
 */
export const FEEDS: Feed[] = [
  { pair: "BTC/USD", label: "Bitcoin", kind: "volatile", sources: 11 },
  { pair: "ETH/USD", label: "Ether", kind: "volatile", sources: 11 },
  { pair: "STRK/USD", label: "Starknet", kind: "volatile", sources: 12 },
  { pair: "EKUBO/USD", label: "Ekubo", kind: "volatile", sources: 2 },
  { pair: "USDC/USD", label: "USDC", kind: "peg", sources: 9 },
  { pair: "USDT/USD", label: "USDT", kind: "peg", sources: 5 },
];

export function feedFor(pair: string): Feed | undefined {
  return FEEDS.find((f) => f.pair === pair);
}

/**
 * Depeg thresholds, in percent away from $1.
 *
 * A stablecoin question is "does it break", so the interesting distances are
 * fractions of a percent, not the ±30% a volatile asset is asked about.
 */
export const DEPEG_STEPS = [0.25, 0.5, 1, 2, 5];

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
