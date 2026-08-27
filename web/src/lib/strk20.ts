/** Wallet API route: the dapp never holds a viewing key or builds a proof. */

import { RpcProvider, WalletAccountV6, walletV6, num } from "starknet";
import { createStore } from "@starknet-io/get-starknet-discovery";
// Must come from the /features subpath.
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import {
  RPC_URL,
  STRK_TOKEN,
  VAULT_ADDRESS,
  VAULT_V2,
  POOL_ADDRESS,
  REQUIRED_WALLET_API,
} from "./config";
import {
  TIER_INDEX,
  comparatorFelt,
  holderFelt,
  kindFelt,
  strikeScaled,
  subjectFelt,
  type Question,
  type SealedForecast,
} from "./forecast";
import { TIERS, type Tier } from "./scoring";

/* Mirrors `ForecastOperation` in contracts/src/vault.cairo. Order is load-bearing. */
export const OP_COMMIT = "0x0";
export const OP_SETTLE = "0x1";
export const OP_FORFEIT = "0x2";

/** Wallet felts reject the leading zeros most addresses are published with. */
export function felt(value: string | bigint | number): string {
  return num.toHex(BigInt(value));
}

/** Normalise calldata, leaving the wallet's own ${...} placeholders alone. */
function calldata(items: readonly string[]): string[] {
  return items.map((item) =>
    item.startsWith("${") ? item : felt(item),
  );
}

export type DiscoveredWallet = WalletWithStarknetFeatures;

/** Wallet discovery through the official store. */
export function walletStore() {
  return createStore({ eip1193Adapters: [] });
}

export function makeProvider() {
  return new RpcProvider({ nodeUrl: RPC_URL });
}

const LAST_WALLET = "xence.wallet.v1";

/** Reconnect without a prompt if this browser connected before. */
export async function reconnect(
  wallets: readonly DiscoveredWallet[],
): Promise<{ wallet: DiscoveredWallet; account: WalletAccountV6 } | null> {
  if (typeof window === "undefined") return null;
  const name = window.localStorage.getItem(LAST_WALLET);
  if (!name) return null;
  const wallet = wallets.find((w) => w.name === name);
  if (!wallet) return null;
  try {
    const account = await WalletAccountV6.connectSilent(makeProvider(), wallet);
    return account ? { wallet, account } : null;
  } catch {
    return null;
  }
}

export function rememberWallet(name: string) {
  try {
    window.localStorage.setItem(LAST_WALLET, name);
  } catch {}
}

export function forgetWallet() {
  try {
    window.localStorage.removeItem(LAST_WALLET);
  } catch {}
}

export async function connect(
  wallet: DiscoveredWallet,
): Promise<WalletAccountV6> {
  return WalletAccountV6.connect(makeProvider(), wallet);
}

/** Capability detection by VERSION QUERY, never by making a data call. */
export async function supportsStrk20(
  wallet: DiscoveredWallet,
): Promise<boolean> {
  try {
    const versions = await walletV6.supportedWalletApi(wallet);
    return versions.some((v: string) => atLeast(v, REQUIRED_WALLET_API));
  } catch {
    return false;
  }
}

function atLeast(version: string, minimum: string): boolean {
  const a = version.split(".").map((n) => parseInt(n, 10) || 0);
  const b = minimum.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return true;
}

/** Shielded balance. */
export async function shieldedBalance(
  account: WalletAccountV6,
  token: string = STRK_TOKEN,
): Promise<bigint> {
  const entries = await account.strk20Balances([token as `0x${string}`]);
  // Felt addresses can be padded or not; compare numerically, never as strings.
  const hit = entries.find((e) => BigInt(e.token) === BigInt(token));
  return hit ? BigInt(hit.balance) : 0n;
}

/** The pool charges a flat fee per private operation, on top of gas. */
export async function poolFee(): Promise<bigint> {
  try {
    const provider = makeProvider();
    const res = await provider.callContract({
      contractAddress: POOL_ADDRESS,
      entrypoint: "get_fee_amount",
      calldata: [],
    });
    return BigInt(res[0] ?? 0);
  } catch {
    return 4n * 10n ** 18n; // documented mainnet value, used only as a floor
  }
}

/** Shield public STRK: two prompts by design, since approve must land before the deposit. */
export async function shield(
  account: WalletAccountV6,
  amount: bigint,
  token: string = STRK_TOKEN,
): Promise<string> {
  const { transaction_hash } = await account.strk20InvokeTransaction([
    { type: "deposit", token: felt(token) as `0x${string}`, amount: felt(amount) },
  ]);
  return transaction_hash;
}

/** Public (unshielded) STRK balance. */
export async function publicBalance(
  address: string,
  token: string = STRK_TOKEN,
): Promise<bigint> {
  const res = await makeProvider().callContract({
    contractAddress: token,
    entrypoint: "balanceOf",
    calldata: [address],
  });
  return BigInt(res[0]) + (BigInt(res[1] ?? 0) << 128n);
}

/** Back a forecaster by private transfer; not even they learn who sent it. */
export async function backForecaster(
  account: WalletAccountV6,
  payout: string,
  amountStrk: number,
  token: string = STRK_TOKEN,
): Promise<string> {
  const amount = BigInt(Math.round(amountStrk)) * 10n ** 18n;
  const { transaction_hash } = await account.strk20InvokeTransaction([
    {
      type: "transfer",
      token: felt(token) as `0x${string}`,
      amount: felt(amount),
      recipient: felt(payout) as `0x${string}`,
    },
  ]);
  return transaction_hash;
}

export function bondAmount(tier: Tier): bigint {
  return BigInt(TIERS[tier].bond) * 10n ** 18n; // STRK has 18 decimals
}

/** Seal a forecast and bond it, in one atomic private transaction. */
export function commitActions(args: {
  sealed: SealedForecast;
  question: Question;
  tier: Tier;
  reputationKey: string;
  signature: { r: string; s: string };
  token?: string;
}) {
  const token = felt(args.token ?? STRK_TOKEN) as `0x${string}`;
  const amount = bondAmount(args.tier);
  const vault = felt(VAULT_ADDRESS) as `0x${string}`;

  return [
    {
      type: "withdraw" as const,
      token,
      amount: felt(amount),
      recipient: vault,
    },
    {
      type: "invoke" as const,
      contract: vault,
      calldata: calldata([
        OP_COMMIT,
        args.sealed.commitmentHash,
        token,
        num.toHex(amount),
        args.reputationKey,
        args.signature.r,
        args.signature.s,
        args.sealed.questionId,
        // v1 has no kind/holder positions; its pair_id slot equals subjectFelt.
        ...(VAULT_V2 ? [kindFelt(args.question), subjectFelt(args.question), holderFelt(args.question)] : [subjectFelt(args.question)]),
        num.toHex(strikeScaled(args.question)),
        num.toHex(BigInt(args.question.horizon)),
        comparatorFelt(args.question.comparator),
        num.toHex(BigInt(TIER_INDEX[args.tier])),
        "0x0", // probability_bp, sealed until reveal
        "0x0", // rationale_hash, sealed until reveal
        "0x0", // salt, sealed until reveal
        "0x0", // note_id, nothing is credited on commit
      ]),
    },
  ];
}

/** Open the seal, settle, take the bond back. The note id is filled by the wallet, since the payout is unknown until the vault scores the call. */
export function revealActions(args: {
  sealed: SealedForecast;
  recipient: string;
  token?: string;
}) {
  const token = felt(args.token ?? STRK_TOKEN) as `0x${string}`;

  return [
    {
      type: "transfer" as const,
      token,
      amount: "OPEN" as const,
      recipient: felt(args.recipient) as `0x${string}`,
    },
    {
      type: "invoke" as const,
      contract: felt(VAULT_ADDRESS) as `0x${string}`,
      calldata: calldata([
        OP_SETTLE,
        args.sealed.commitmentHash,
        token,
        "0x0",
        "0x0",
        "0x0",
        "0x0",
        args.sealed.questionId,
        // settle reads the question from storage; only the arity differs.
        ...(VAULT_V2 ? ["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0"] : ["0x0", "0x0", "0x0", "0x0", "0x0"]),
        num.toHex(BigInt(args.sealed.probabilityBp)),
        args.sealed.rationaleHash,
        args.sealed.salt,
        "${openNoteIds[0]}",
      ]),
    },
  ];
}

export type XenceActions =
  | ReturnType<typeof commitActions>
  | ReturnType<typeof revealActions>;

export async function submit(
  account: WalletAccountV6,
  actions: XenceActions,
): Promise<string> {
  const { transaction_hash } = await account.strk20InvokeTransaction(actions);
  return transaction_hash;
}

/** Dry run. */
export async function dryRun(
  account: WalletAccountV6,
  actions: XenceActions,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await account.strk20PrepareInvoke(actions, true);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Not yet available; left unimplemented rather than faked. */
export const WALLET_ATTESTED_PSEUDONYM_SUPPORTED = false;

/** Private transactions are relayed, so the sender is never the user. */
export const SENDER_IS_RELAYER = true;

/** New notes mature ~10 blocks before they can be spent. */
export const NOTE_MATURITY_BLOCKS = 10;

/** Turn a wallet error into something a person can act on. */
export function explainWalletError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);

  if (/NOT_REGISTERED/i.test(raw)) {
    return (
      "Your wallet has not joined the privacy pool yet. Registering publishes " +
      "a viewing key on-chain, and only the wallet can do it. Xence never " +
      "holds that key. Open Ready, turn on its privacy / shielded balance " +
      "feature once, then come back."
    );
  }
  if (/INVALID_REQUEST_PAYLOAD/i.test(raw)) {
    return (
      "The wallet rejected the shape of this request. That usually means the " +
      "wallet's STRK20 support is older than the actions Xence is sending. " +
      "Check for an extension update. (Raw: INVALID_REQUEST_PAYLOAD)"
    );
  }
  if (/USER_REFUSED|rejected|denied/i.test(raw)) {
    return "You declined the request in your wallet.";
  }
  if (/INSUFFICIENT|balance/i.test(raw)) {
    return "Not enough balance to cover the amount plus the pool fee.";
  }
  if (/HORIZON_IN_PAST/i.test(raw)) {
    return (
      "The horizon landed in the past as the chain sees it, which usually means " +
      "this device's clock is behind. Xence now reads the time from Starknet, so " +
      "reloading the page should fix it."
    );
  }
  // The dry run already passed, so the calldata was fine and the chain refused it.
  if (/Paymaster|TRANSACTION_EXECUTION_ERROR|EXECUTION_ERROR/i.test(raw)) {
    return (
      "The pool accepted the request but the transaction failed on-chain. The " +
      "usual causes are too little shielded STRK for the bond plus the 6 STRK " +
      "fee, or notes shielded moments ago that have not matured yet (give it " +
      "about ten blocks). Check your shielded balance, then try again."
    );
  }
  return raw;
}

export function formatStrk(wei: bigint, dp = 2): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n) / 10n ** BigInt(18 - dp);
  return `${whole}.${frac.toString().padStart(dp, "0")}`;
}
