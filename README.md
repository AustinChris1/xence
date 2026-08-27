<div align="center">

<img src="web/src/app/icon.svg" width="72" height="72" alt="Xence" />

# Xence

**The private signal economy: sealed calls, on-chain track records, invisible backers.**

Analysts and AI agents seal forecasts before the outcome exists, bonded through
the [STRK20](https://strk20.starknet.io) privacy pool. The chain scores their
calibration; supporters pay the good ones privately. Forecast prices, or
Starknet itself: pool TVL and any on-chain metric settle without an oracle.
Live on mainnet.

</div>

---

## What this is

The internet's alpha economy runs on evidence that has been edited. Every
analyst, signal group and newsletter sells a track record where the wins were
screenshotted and the losses were quietly deleted. It is survivorship bias sold
as expertise, and people pay monthly for it.

The obvious fix, publishing your calls in advance, destroys the person
making them. Broadcast a real position before you have built it and you get
front-run; give away your reasoning and the edge you were selling is now free.

**Honesty and secrecy pull in opposite directions, and every existing attempt at
this problem has had to pick one.**

Xence dissolves the conflict, and it can only be dissolved on a chain with a
shielded pool:

- The **claim** is public, binding and timestamped: a commitment hash written
  on-chain before the outcome exists.
- The **position** behind it is completely invisible. The bond is funded from
  inside the STRK20 privacy pool, so no wallet, no balance and no other holding
  is exposed.

This is the rare case where privacy makes someone *more* accountable rather than
less. That is the whole idea.

## How it works

| | | |
|---|---|---|
| **1. Seal** | You state a probability ("72% that BTC closes above $120k on 30 September") and write your thesis. Only `poseidon(tag, question, probability, rationale, salt)` goes on-chain. | Nobody can read the number, the direction, or the reasoning. Not other traders. Not us. |
| **2. Bond** | The forecast is backed by a stake shielded inside the STRK20 pool. | The public sees a conviction tier: Bronze, Silver, Gold. Not the wallet, not the amount, not your book. |
| **3. Reveal** | After the horizon you publish the salt and probability. The chain recomputes the hash against what you committed weeks earlier. | There is no way to edit a call after the fact, because the commitment predates the outcome. |
| **4. Score** | A [Pragma](https://www.pragma.build) price feed resolves the question on-chain. Your Brier score and calibration curve update; the bond settles. | Well calibrated earns it back with a share of the research pool. Confidently wrong is partially slashed. |

### The rule the whole thing rests on

The obvious attack is to seal a hundred forecasts, reveal the ones that came
good, and let the rest expire, which is the deleted-tweet problem wearing a
cryptographic hat.

So **an unrevealed forecast is not ignored. It is scored at the maximum possible
error (Brier 1.0), worse than any wrong answer you could have given on purpose,
and the bond is slashed.**

Being wrong out loud is cheap. Disappearing is the most expensive thing a
forecaster can do. That asymmetry is what turns a pile of hashes into a track
record worth trusting.

### Calibration, not luck

Xence does not ask whether you were right. It asks whether you knew how right
you were. Scoring uses the **Brier score**, a proper scoring rule: it is
minimised only by reporting what you genuinely believe, so no hedging strategy
beats honesty. The maths does the enforcement, not a moderator.

## What stays private, and what does not

Privacy here is surgical, not blanket.

| Hidden | Visible |
|---|---|
| Which wallet funded the bond | That a forecast was sealed, and when |
| The probability and thesis, until reveal | The question and its resolution date |
| Who submitted the transaction, since a relayer signs, not you | The bond and its tier, fixed sizes so an amount identifies nobody |
| Which notes were spent, and the balance behind them | The full call, permanently, once revealed |
| Who backs which forecaster, and with how much | Calibration curve and Brier history |
| Every other position you hold | Aggregate flows in and out of the pool |

Honest about the edges: shielding and unshielding are public ERC-20 legs, and
the timing of a pool interaction is observable. Xence says so in-product rather
than implying the pool is magic.

## STRK20 integration

Xence takes the **Starknet Wallet API** route. The app never sees a viewing key,
never discovers a note, and never generates a proof. It describes intent as
actions and the user's privacy wallet does the rest.

| Surface | How Xence uses it |
|---|---|
| Anonymizer contract (`privacy_invoke`) | `XenceVault` is a stateful helper. On commit the pool withdraws the bond to it and it returns an **empty span**, the protocol's own idiom for "credit nothing yet", parking the stake until settlement. |
| Open notes | Settlement credits an open note via the `${openNoteIds[0]}` placeholder, because the payout cannot be known at proof time: the oracle has not been read yet. |
| `strk20InvokeTransaction` | Every private operation is one atomic transaction carrying two actions. |
| `strk20PrepareInvoke(actions, true)` | Dry-run before every submission, to catch calldata-shape errors without paying for a proof. |
| `supportedWalletApi` | Capability detection by version query, never by probing `strk20Balances`, which would ask the user to consent to balance access for no reason. |
| Signed pseudonyms | A forecaster is a STARK-curve public key, authenticated on-chain by a signature over each commitment, so nobody can commit deliberately terrible calls under a rival's name to tank a reputation they don't own. |
| Escrowed viewing key | The pool's compliance path still applies: a forecaster can prove authorship of a past call to a regulator or employer without opening anything else. |

## For agents

The dapp is one client. The primitive is for anything that makes calls,
including AI agents that need a track record which is not a README claim.

An agent holds one STARK scalar, calls `POST /api/seal` with its question and
probability, and gets back the exact pool calldata for the bond. The server
signs nothing on its behalf and never learns which wallet funds it. The bot
never needs STRK, a wallet, or a viewing key to *build* the forecast; the
funding leg stays wherever the operator keeps it.

[`examples/signal-bot.mjs`](examples/signal-bot.mjs) is the whole integration:
a bot that seals what it was already going to post, in ~60 lines. As agent
reputation standards (ERC-8004 and kin) look for verifiable history, a
Brier-scored on-chain record beats a self-reported one.

## Stack

- **Contracts**: Cairo, Scarb, Starknet Foundry. `XenceVault` (anonymizer) and
  `XenceRegistry` (public reputation).
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
  Motion, lucide-react, pnpm.
- **Chain**: `starknet.js@10.4.0`, `@starknet-io/get-starknet-discovery@6.0.3`,
  `@starknet-io/get-starknet-wallet-standard@6.0.3`,
  `@starknet-io/types-js@0.10.3`, the combination the official STRK20
  integration skill reports as tested end to end.
- **Oracle**: Pragma, for deterministic on-chain settlement.

## Running it

```bash
pnpm install          # from web/
cp .env.example .env.local
pnpm dev
```

Set `NEXT_PUBLIC_RPC_URL` to your own Starknet mainnet RPC. A free
[Alchemy](https://www.alchemy.com) key works:
`https://starknet-mainnet.g.alchemy.com/v2/<YOUR_KEY>`. The public fallback is
rate-limited and will not survive a live demo. **Never commit the key.**

You need a privacy-enabled Starknet wallet supporting Wallet API ≥ 0.10.3
(Ready today; Xverse in progress).

## The mark

> Xence's mark is the probability square's two diagonals, the solid line of
> verified truth and the broken line of a still-sealed forecast, crossing at
> the point of maximum uncertainty, where the seal sits.

The frame is the unit square of a calibration plot. The solid diagonal is the
45° line of perfect calibration, unbroken because a resolved outcome is not
negotiable. The broken diagonal is a forecast while it is still sealed: two
segments that stop short of the centre, because a sealed call has not yet
touched the truth. The seal sits at (0.5, 0.5): maximum uncertainty, the least
useful forecast anyone can make, and exactly the thing this protocol exists to
price.

The name is one letter off **prescience**, knowing before it happens.

## Licence

Apache-2.0.

---

<div align="center">
<sub>Built for the <a href="https://strk20.starknet.io/hackathon">STRK20 Private Sprint</a> · Starknet mainnet</sub>
</div>
