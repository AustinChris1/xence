# Using the dapp

A walkthrough of [xence.vercel.app](https://xence.vercel.app) for testers:
what every control does and what happens on-chain when you press it.

## Before you start

- **Wallet**: [Ready](https://www.ready.co/) (Chrome extension), the wallet
  that implements the STRK20 wallet API. Other Starknet wallets can browse but
  cannot seal. The app tells you if yours can't.
- **Funds**: a little STRK on mainnet. Shielding, sealing and revealing are
  real transactions; the pool charges 6 STRK per private operation on top of
  the bond you choose.

## 1 · Connect

The button in the top-right lists detected wallets. Pick one; the app probes
whether it speaks the STRK20 API and remembers your choice for next time.
Connecting signs nothing and costs nothing.

## 2 · Shield

**Shield** moves STRK from your public wallet balance into the STRK20 privacy
pool. Inside the pool your funds become private notes, and this is the money that
will silently back your forecasts. The bar shows both balances: public wallet
and shielded pool.

Shield more than one bond's worth so you can seal several forecasts without
topping up.

## 3 · Create your forecasting identity

The first time you seal, the app derives a **reputation key**: a fresh STARK
keypair, generated in your browser, never sent anywhere. This key *is* your
forecaster identity: your record, your leaderboard entry and your profile page
all hang off it, and it has no on-chain connection to your wallet.

It lives in your browser's storage. Export it if you care about the record:
lose the key, lose the identity.

## 4 · Build a forecast

The forecast card walks left to right:

- **Price / Ecosystem**: what kind of question. *Price* settles on the Pragma
  oracle median, and each row shows how many independent publishers back that
  median (fewer than three is labelled "thin", meaning easier to move). *Ecosystem* settles by reading an
  on-chain balance directly, for example STRK held by the privacy pool, with
  no oracle involved.
- **Move + direction**: you forecast a *move*, not a level. "Up more than 3%"
  or "down more than 5%" from where the feed stands right now.
- **Horizon**: when the question is checked: 1 hour to 30 days out.
- **The dial**: your probability, 1–99%. This is the number you are scored
  on, so make it honest: overconfidence is what gets slashed.
- **Conviction tier**: how much bond backs the call. Higher tiers move your
  reputation more (×1 / ×3 / ×8) and put more STRK at stake.

## 5 · Seal

Pressing **Seal** hashes your forecast, signs it with your reputation key, and
asks the wallet to fund the bond from your shielded balance. One transaction
lands on-chain carrying only the hash. Direction, confidence and author stay
sealed. The forecast appears in your **Sealed** list with a countdown.

## 6 · Reveal

Once the horizon passes, the sealed card grows a **Reveal** button. Revealing
publishes the original forecast, and the contract does everything else in the
same transaction: verifies it against the hash, reads the oracle or the chain,
computes your Brier score, updates your record, and returns your bond to your
shielded balance, adjusted for how well you called it.

**Do not skip this.** A forecast left unrevealed for 48 hours past its horizon
can be forfeited by anyone: the bond is lost and the miss is permanent. The
countdown on the card is there for a reason.

## 7 · Read the record

- **Your record** (in the app): your open, resolved and forfeited counts,
  mean Brier score, and skill versus the coin-flip baseline.
- **On the record**: the live feed of everyone's seals, settlements and
  forfeits, rebuilt from chain events.
- **Leaderboard**: every scored forecaster, ranked by calibration. Click any
  handle for their full profile: calibration chart, history, the works.
- **Profile pages** (`/f/yourkey`): shareable. This is the link that replaces
  the screenshot: a track record nobody can have edited.

## What each transaction costs

| Action | On-chain cost |
| --- | --- |
| Connect | nothing |
| Shield | gas + amount moved into the pool |
| Seal | bond (your tier) + 6 STRK pool fee |
| Reveal | 6 STRK pool fee; bond returns ±score adjustment |
| Forfeit (if you never reveal) | entire bond |

The bond round-trips through the pool, so wins and losses stay as invisible as
the position itself. Nothing goes to Xence: there is no treasury and no fee
switch, and slashed bonds fund the bonuses of better forecasters.
