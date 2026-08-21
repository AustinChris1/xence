/**
 * Network and contract configuration.
 *
 * Deployed addresses are injected at build time so the same code runs against
 * Sepolia during development and mainnet for the judged deployment.
 *
 * The RPC key is read from the environment and never committed. Point
 * NEXT_PUBLIC_RPC_URL at your own Alchemy endpoint. Note that Starknet uses a
 * different path from Alchemy's EVM chains:
 *
 *   https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/<KEY>
 *
 * Alchemy's free tier is 30M compute units a month and a call costs 10-26 CU,
 * so nothing this app does will come close to the ceiling.
 *
 * The fallbacks below need no key and are rate-limited: fine for a first load,
 * not for a demo in front of judges.
 */

export const CHAIN = (process.env.NEXT_PUBLIC_CHAIN ?? "mainnet") as
  | "mainnet"
  | "sepolia";

/** Starknet mainnet is CHAIN_ID SN_MAIN. */
export const CHAIN_ID = CHAIN === "mainnet" ? "SN_MAIN" : "SN_SEPOLIA";

/**
 * Keyless fallbacks, verified reachable and able to read the STRK20 pool.
 *
 * Blast used to be the obvious default and is now a trap: its Starknet
 * endpoints answer with `-32000 Blast API is no longer...` rather than a
 * network error, so a naive health check that only catches transport failures
 * still reports it as up.
 */
const PUBLIC_RPC = {
  mainnet: "https://api.cartridge.gg/x/starknet/mainnet",
  sepolia: "https://api.cartridge.gg/x/starknet/sepolia",
} as const;

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? PUBLIC_RPC[CHAIN];

/** True when running on a shared endpoint, so the UI can say so honestly. */
export const USING_PUBLIC_RPC = !process.env.NEXT_PUBLIC_RPC_URL;

/** The STRK20 privacy pool. Every judged transaction must touch this address. */
export const POOL_ADDRESS =
  process.env.NEXT_PUBLIC_POOL_ADDRESS ??
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";

/** Minimum Starknet Wallet API version carrying the STRK20 methods. */
export const REQUIRED_WALLET_API = "0.10.3";

/** Canonical STRK on Starknet — the bond asset. */
export const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/** Deployed Xence contracts. Filled by `pnpm contracts:deploy`. */
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? "";
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? "";

/** Pragma oracle — the settlement authority for every question. */
export const PRAGMA_ORACLE =
  process.env.NEXT_PUBLIC_PRAGMA_ORACLE ??
  (CHAIN === "mainnet"
    ? "0x2a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b"
    : "0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a");

export const EXPLORER =
  CHAIN === "mainnet"
    ? "https://voyager.online"
    : "https://sepolia.voyager.online";

export function txUrl(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}

export function contractUrl(address: string) {
  return `${EXPLORER}/contract/${address}`;
}

export const DAPP_NAME = "xence";

export const IS_CONFIGURED = Boolean(VAULT_ADDRESS);
