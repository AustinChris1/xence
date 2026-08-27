/** Network and contract configuration. */

/** An unset env var arrives as "" from .env files, and ?? does not catch that. */
function envOr(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return v === "" ? fallback : v;
}

export const CHAIN = (process.env.NEXT_PUBLIC_CHAIN ?? "mainnet") as
  | "mainnet"
  | "sepolia";

/** Starknet mainnet is CHAIN_ID SN_MAIN. */
export const CHAIN_ID = CHAIN === "mainnet" ? "SN_MAIN" : "SN_SEPOLIA";

/** Keyless fallbacks, verified reachable and able to read the STRK20 pool. */
const PUBLIC_RPC = {
  mainnet: "https://api.cartridge.gg/x/starknet/mainnet",
  sepolia: "https://api.cartridge.gg/x/starknet/sepolia",
} as const;

export const RPC_URL = envOr(process.env.NEXT_PUBLIC_RPC_URL, PUBLIC_RPC[CHAIN]);

/** True when running on a shared endpoint, so the UI can say so honestly. */
export const USING_PUBLIC_RPC = RPC_URL === PUBLIC_RPC[CHAIN];

/** The STRK20 privacy pool. */
export const POOL_ADDRESS = envOr(
  process.env.NEXT_PUBLIC_POOL_ADDRESS,
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a",
);

/** Minimum Starknet Wallet API version carrying the STRK20 methods. */
export const REQUIRED_WALLET_API = "0.10.3";

/** Canonical STRK on Starknet, the bond asset. */
export const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/** Deployed Xence contracts. */
export const VAULT_ADDRESS = envOr(process.env.NEXT_PUBLIC_VAULT_ADDRESS, "");
export const REGISTRY_ADDRESS = envOr(process.env.NEXT_PUBLIC_REGISTRY_ADDRESS, "");

/** Pragma oracle, the settlement authority for price questions. */
export const PRAGMA_ORACLE = envOr(
  process.env.NEXT_PUBLIC_PRAGMA_ORACLE,
  CHAIN === "mainnet" ? "0x2a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b" : "0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a",
);

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

/** Which wire format the configured vault speaks; v2 adds metric questions. */
export const VAULT_V2 = envOr(process.env.NEXT_PUBLIC_VAULT_V2, "") === "1";

/** The payout rail needs a registry class that is not declared yet. */
export const PAYOUT_LIVE = envOr(process.env.NEXT_PUBLIC_PAYOUT_LIVE, "") === "1";

/** Registries newest first: writes go to the first, reads merge across all. */
export const REGISTRY_ADDRESSES = [
  REGISTRY_ADDRESS,
  envOr(process.env.NEXT_PUBLIC_REGISTRY_V1, ""),
].filter(Boolean);
