/**
 * STRK20 INTEGRATION
 *
 * Xence takes the Starknet Wallet API route: the dapp never touches a viewing
 * key, never discovers a note, never generates a proof. It describes what it
 * wants as a list of actions and the user's privacy wallet does the rest.
 *
 * Every private operation in Xence is one atomic STRK20 transaction:
 *
 *   COMMIT   withdraw(bond → vault) + invoke(vault.commit)
 *            The pool pays the vault publicly. Nothing links the payment to the
 *            forecaster, and the calldata carries only a hash.
 *
 *   REVEAL   transfer(amount: "OPEN") + invoke(vault.settle)
 *            The open note is the slot the settled bond gets credited into. Its
 *            amount cannot be known at proof time because the oracle has not
 *            been read yet — which is exactly what open notes are for.
 *
 * Stack is pinned to the combination the official STRK20 integration skill
 * reports as tested end to end: starknet@10.4.0, get-starknet-discovery@6.0.3,
 * get-starknet-wallet-standard@6.0.3, types-js@0.10.3. Do not float these
 * independently — the wallet API surface moved between 10.4 and 10.7.
 */

import { RpcProvider, WalletAccountV6, walletV6, num } from "starknet";
import { createStore } from "@starknet-io/get-starknet-discovery";
// Must come from the /features subpath. The package root does not re-export it
// and importing from there fails with TS2459.
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import {
  RPC_URL,
  STRK_TOKEN,
  VAULT_ADDRESS,
  POOL_ADDRESS,
  REQUIRED_WALLET_API,
} from "./config";
import {
  TIER_INDEX,
  comparatorFelt,
  strikeScaled,
  type Question,
  type SealedForecast,
} from "./forecast";
import { TIERS, type Tier } from "./scoring";
import { shortString } from "starknet";

/* Mirrors `ForecastOperation` in contracts/src/vault.cairo. Order is load-bearing. */
export const OP_COMMIT = "0x0";
export const OP_SETTLE = "0x1";
export const OP_FORFEIT = "0x2";

/**
 * Normalise a value to the wallet API's FELT shape.
 *
 * The spec pattern is `^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,62})$` — a single
 * `0x0`, or a first digit that is not zero. Leading zeros are INVALID.
 *
 * This matters because the canonical way every Starknet address is published,
 * including STRK's own `0x04718f5a…` and the STRK20 pool's `0x040337b1…`, is
 * zero-padded. Passing those through verbatim makes the wallet reject the
 * entire request as INVALID_REQUEST_PAYLOAD, naming nothing in particular —
 * so every address and calldata item crossing this boundary goes through here.
 */
export function felt(value: string | bigint | number): string {
  return num.toHex(BigInt(value));
}

/**
 * Normalise calldata, leaving the wallet's own placeholders alone.
 *
 * `${openNoteIds[N]}` and `${poolAddress}` are substituted by the wallet at
 * assembly time and are not felts — running them through BigInt() would throw.
 * Everything else is: Poseidon hashes and signature components routinely start
 * with a zero byte, so normalising only the obvious addresses is not enough.
 */
function calldata(items: readonly string[]): string[] {
  return items.map((item) =>
    item.startsWith("${") ? item : felt(item),
  );
}

export type DiscoveredWallet = WalletWithStarknetFeatures;

/**
 * Wallet discovery through the official store, which watches for wallets that
 * announce themselves late. A one-shot scan of `window.starknet_*` misses
 * extensions that inject after first paint.
 *
 * `eip1193Adapters: []` is load-bearing. The store defaults to
 * DEFAULT_EIP1193_ADAPTERS, which wraps EVM wallets — MetaMask, Keplr, OKX —
 * as *virtual* Starknet accounts. They cannot shield, and worse, merely
 * querying one makes it throw up a connect dialog: on a page that queries
 * capabilities as it loads, that becomes a popup the user cannot dismiss.
 *
 * Xence needs a wallet that holds a viewing key and generates proofs, which no
 * EVM wallet does, so none of them belong in the picker at all.
 */
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

/**
 * Capability detection by VERSION QUERY, never by making a data call.
 *
 * The tempting shortcut is to call `strk20Balances` and see whether it throws.
 * Don't: reading balances is gated behind a user consent prompt, so probing it
 * asks the user to approve access to data the app has no reason to want yet.
 * Asking a stranger for their balance before they have done anything is both
 * a bad first impression and a real privacy smell.
 */
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

/**
 * Shielded balance. This DOES prompt the user for consent, so it is only ever
 * called from a deliberate "show my private balance" affordance, never on load.
 */
export async function shieldedBalance(
  account: WalletAccountV6,
  token: string = STRK_TOKEN,
): Promise<bigint> {
  const entries = await account.strk20Balances([token as `0x${string}`]);
  // Felt addresses can be padded or not; compare numerically, never as strings.
  const hit = entries.find((e) => BigInt(e.token) === BigInt(token));
  return hit ? BigInt(hit.balance) : 0n;
}

/**
 * The pool charges a flat fee per private operation, on top of gas. Wallet
 * flows sponsor gas but NOT the pool fee, so a MAX-amount prefill that ignores
 * it fails after the user has already signed. Read it, never hardcode it.
 */
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

/**
 * Shield public STRK into the pool.
 *
 * Two wallet prompts, by design: the ERC-20 `approve` must land on-chain before
 * the private deposit. The UI labels both steps, because an unlabelled second
 * prompt reads as a duplicate-transaction bug and people reject it.
 *
 * Shield well ahead of committing. A deposit is public and names the depositor;
 * a later commit has no public leg tying back to it. That separation in TIME is
 * what actually breaks the linkage — doing both in one session narrows the
 * anonymity set to whoever deposited in the last few minutes.
 */
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

/**
 * Public (unshielded) STRK balance.
 *
 * Read straight from the ERC-20 rather than through the wallet: this is the
 * ordinary, visible balance, so it needs no viewing key and no consent prompt.
 * It is the number that tells a user whether they have anything to shield yet.
 */
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

export function bondAmount(tier: Tier): bigint {
  return BigInt(TIERS[tier].bond) * 10n ** 18n; // STRK has 18 decimals
}

/**
 * COMMIT — seal a forecast and bond it, in one atomic private transaction.
 *
 * The vault parks the bond and returns an empty `Span<OpenNoteDeposit>`, which
 * the protocol explicitly allows: an empty span means "credit nothing" for a
 * step that should not release funds yet. Nothing comes back out of the vault
 * until the forecast is settled.
 *
 * What an observer sees: the pool paid the Xence vault some STRK, and a hash
 * was written. Not who, not what was predicted, not which direction.
 */
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
        shortString.encodeShortString(args.question.asset),
        num.toHex(strikeScaled(args.question.strikeUsd)),
        num.toHex(BigInt(args.question.horizon)),
        comparatorFelt(args.question.comparator),
        num.toHex(BigInt(TIER_INDEX[args.tier])),
        "0x0", // probability_bp — sealed until reveal
        "0x0", // rationale_hash — sealed until reveal
        "0x0", // salt          — sealed until reveal
        "0x0", // note_id       — nothing is credited on commit
      ]),
    },
  ];
}

/**
 * REVEAL — open the seal, let the oracle settle it, take the bond back.
 *
 * `${openNoteIds[0]}` is a placeholder the wallet substitutes at assembly time:
 * the note does not exist yet when this calldata is built, and its amount is
 * only known after the vault has read the price and scored the call.
 */
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
        "0x0",
        "0x0",
        "0x0",
        "0x0",
        "0x0",
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

/**
 * Dry run. `strk20PrepareInvoke(actions, true)` skips proof generation, so it
 * is cheap enough to run before every submission and catches calldata-shape
 * mistakes that would otherwise cost a ~29 s proof to discover.
 */
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

/**
 * NOT YET AVAILABLE — deliberately left unimplemented rather than faked.
 *
 * `strk20ShadowAccountCommitment` would give us a wallet-attested pseudonym:
 * the partial, nonce-free commitment is shared by every shadow account a user
 * derives for one dapp, so publishing it identifies a returning forecaster
 * without revealing any individual account. That is strictly better than a
 * self-asserted key.
 *
 * It does not exist on `WalletAccountV6` in starknet.js 10.4.0, the version the
 * official skill reports as tested end to end against real wallets. Rather than
 * float the dependency forward to get one nice-to-have and risk the wallet
 * connection that everything else depends on, Xence authenticates forecasters
 * with a STARK-curve signature over each commitment (see `lib/forecast.ts`),
 * which needs nothing from the wallet at all.
 *
 * Revisit when the tested stack includes it.
 */
export const WALLET_ATTESTED_PSEUDONYM_SUPPORTED = false;

/**
 * Private transactions are submitted by a relayer, so every user's transaction
 * has the same sender. Never attribute activity from the transaction sender —
 * read the pool's Deposit event instead.
 */
export const SENDER_IS_RELAYER = true;

/** New notes mature ~10 blocks before they can be spent. Build the wait into UX. */
export const NOTE_MATURITY_BLOCKS = 10;

/**
 * Turn a wallet error into something a person can act on.
 *
 * The wallet API returns short machine codes. Shown raw they read as bugs in
 * this app, when the usual cause is a one-time setup step that only the wallet
 * can perform — the dapp has no way to do it, by design, because it never holds
 * the viewing key.
 */
export function explainWalletError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);

  if (/NOT_REGISTERED/i.test(raw)) {
    return (
      "Your wallet has not joined the privacy pool yet. Registering publishes " +
      "a viewing key on-chain, and only the wallet can do it — Xence never " +
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
  return raw;
}

export function formatStrk(wei: bigint, dp = 2): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n) / 10n ** BigInt(18 - dp);
  return `${whole}.${frac.toString().padStart(dp, "0")}`;
}
