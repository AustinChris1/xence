# Overview

**Xence is proof you were right before it happened.**

Analysts, traders and AI agents seal forecasts on Starknet before the outcome
exists. The chain scores them when the outcome arrives. What accumulates is the
one thing the internet's signal economy has never had: a track record that
cannot be edited after the fact.

## The problem

The alpha economy runs on evidence that has been curated. Every signal group,
newsletter and "on-chain analyst" sells a history where the wins were
screenshotted and the losses quietly disappeared. It is survivorship bias sold
as expertise, and people pay monthly for it.

The obvious fix — publish every call in advance, publicly — destroys the person
making it. Broadcast a position before you have built it and you get front-run;
give away the reasoning and the edge you were selling is now free.

Honesty and secrecy pull in opposite directions, and every previous attempt at
this problem picked one and gave up the other.

## The dissolve

Xence separates the two halves of a forecast and gives each what it needs:

- The **claim** is public, binding and timestamped — a Poseidon commitment
  written on-chain before the outcome exists. Nobody, including us, can alter
  or delete it.
- The **position** is invisible — the bond behind every forecast is funded from
  inside the [STRK20](https://strk20.starknet.io) privacy pool, so no wallet,
  no balance and no other holding is ever exposed. Forecasters are known only
  by a pseudonymous STARK key.

This is only possible on a chain with a shielded pool. The privacy layer is not
a feature bolted on — it is the reason the design works at all.

## What settles a forecast

Two kinds of questions, one settlement path each:

- **Price** — "BTC up more than 3% within 7 days." Settled against the
  [Pragma](https://www.pragma.build/) oracle median at the horizon.
- **Ecosystem** — "STRK held by the privacy pool crosses 3M within 30 days."
  Settled by reading the ERC-20 balance directly on-chain at the horizon. No
  oracle, no committee: the chain is the source.

## What accumulates

Every settled forecast updates a **Brier score** — the standard measure of
probabilistic calibration, computed entirely on-chain. Good calls earn a bonus
paid from the slashed bonds of bad ones; forecasts abandoned unrevealed forfeit
their bond and are scored at maximum error, permanently. The leaderboard ranks
skill against the coin-flip baseline — not profit, not follower count.

## Live on mainnet

| Contract | Address |
| --- | --- |
| Vault (v2) | `0x38b19de9d117d377861bd14dafb1bbdcfeae5e0ad555b91dc76795420643dac` |
| Registry (v2) | `0x19e6490c842701904b270c1c1cd3da6a21f72d322448ecd87a24ea8dca0c8ad` |
| STRK20 pool | `0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a` |

No admin keys, no upgradeability, no treasury. The registry's link to its vault
is set once and frozen forever. Source: [github.com/AustinChris1/xence](https://github.com/AustinChris1/xence).
