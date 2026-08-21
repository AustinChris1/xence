# Xence contracts

> **⚠ Draft. Not audited, not reviewed by StarkWare.**
>
> `XenceVault` custodies user bonds across transactions. An anonymizer contract
> is the app team's code to review and audit, and this has had neither. Read it
> before you trust it with size.

Two contracts, deliberately split so the part that holds money is as small as
possible:

| | |
|---|---|
| **`XenceVault`** (`src/vault.cairo`) | The anonymizer. Implements `privacy_invoke`, parks bonds, settles against the oracle, credits open notes. This is the part that needs auditing. |
| **`XenceRegistry`** (`src/registry.cairo`) | The public reputation ledger. Holds no funds, never sees a wallet address, keyed only by pseudonymous reputation keys. Append-only bookkeeping anyone can index. |

## The three legs

**Commit** — the pool withdraws the bond to the vault, then calls
`privacy_invoke`. The vault stores a commitment hash and returns an **empty
span**, the protocol's idiom for "credit nothing yet". Calldata carries a hash,
a question id, a horizon and a tier — not the probability, not the thesis, not
even the direction.

**Settle** — after the horizon, the forecaster reveals the preimage. The vault
recomputes the hash, reads a Pragma median price, scores the call with the
Brier rule, approves the pool, and returns an `OpenNoteDeposit`. The payout
must land in an *open* note precisely because its amount cannot be known at
proof time: the oracle has not been read yet.

**Forfeit** — runs outside the pool entirely. If the horizon passes and nobody
reveals, anyone may forfeit the forecast. The bond is slashed and the registry
records the maximum possible error. Without this leg a forecaster seals a
hundred calls, reveals the winners, and lets the rest quietly expire. A keeper
cut is paid to whoever calls it, because an unenforced deadline is the same as
no deadline.

## Defences worth knowing about

- **`privacy_invoke` asserts the caller is the pool.** The vault holds funds
  across transactions, so the pool address is pinned in the constructor.
- **Commit verifies a STARK-curve signature.** Invoke calldata is public, so the
  vault cannot take a secret. A bare `reputation_key` argument would let anyone
  commit deliberately terrible forecasts under a rival's name and destroy a
  record they do not own; a signature over the commitment closes that. The
  signed message covers the question, horizon and tier too, so it cannot be
  lifted onto a different question or replayed at a cheaper tier.
- **Commit verifies it was actually paid.** Rather than trusting that the pool's
  withdraw landed, it checks the vault's own ERC-20 balance covers every
  obligation it would now be carrying.
- **The bonus is bounded by the research pool.** The vault never promises money
  it does not hold, so it cannot be drained by a run of well-calibrated
  settlements.
- **Salted commitments.** Without a salt the probability field has 10 001
  possible values and anyone could brute-force the commitment the moment it
  lands, making the seal purely decorative.

## Build and test

```bash
cd contracts
scarb build
scarb cairo-test
```

16 tests, including a **cross-language parity test**. The commitment hash is
built in TypeScript when a forecast is sealed and rebuilt in Cairo when it is
revealed; if those ever disagree, every commitment the frontend made becomes
permanently unrevealable *and gets slashed as a forfeit*. That is the worst
thing this codebase could do to a user, so a fixed vector is asserted on both
sides. Regenerate it with:

```bash
node contracts/scripts/hash-parity.mjs
```

If a parity test fails, do not edit the expectation — find out which side moved.

## Deploy

```bash
cp web/.env.example web/.env.local   # fill in RPC + deployer key
node contracts/scripts/deploy.mjs
```

The registry deploys first (the vault needs its address), then the vault, then
`set_vault` closes the link. `set_vault` is one-shot and then frozen: a registry
whose writer can be swapped is a registry whose history can be rewritten.

Addresses land in `contracts/deployments.json` and are printed as the two env
lines the frontend needs.

## Toolchain

Scarb 2.20.0 / Cairo 2.20.0. Starknet Foundry ships no Windows binary at
v0.63.0, so tests run under `scarb cairo-test` and deployment goes through
starknet.js rather than `sncast`.
