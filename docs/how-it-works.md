# How it works

The simplest way to understand Xence: **a sealed envelope, a locked deposit,
and a referee that cannot be bribed.**

## The sealed envelope

Imagine you believe ETH will rise more than 5% this week. You write that claim
on a card, along with how confident you are — say 80% — seal it in an envelope,
and hand it to a notary who stamps today's date on the outside.

Nobody can read the card. But nobody can deny the envelope exists, or when it
was sealed, or swap the card later.

That is exactly what sealing a forecast does. The "envelope" is a cryptographic
hash written to Starknet. The hash proves the forecast existed at that moment,
but reveals nothing about what it says — not the direction, not the
confidence, not who made it.

## The locked deposit

Talk is free, so an envelope alone proves very little — you could seal a
hundred contradictory envelopes and later open only the winners.

Xence closes that loophole with a **bond**. Sealing costs something: STRK,
locked in the vault until the forecast resolves. And here is the part that
makes cherry-picking impossible:

> If you never open the envelope, you lose the bond — and your record is
> scored as if you were maximally wrong.

Silence is not neutral. Walking away from a bad call costs more than admitting
it. Every envelope you seal **will** count, one way or the other.

## The referee

When the deadline arrives, you reveal what was in the envelope. The contract
checks your reveal actually matches the sealed hash (so you cannot change your
story), then looks up what really happened:

- For **price** questions it asks the Pragma oracle — a median across many
  independent publishers, so no single party controls the answer.
- For **ecosystem** questions it reads the number directly from the chain —
  for example, how much STRK a contract holds. There is no oracle to trust
  because the chain itself is the answer.

## The score

You are not scored on right-or-wrong alone. You are scored on **calibration**:
was your confidence honest?

Saying "80% sure" and being right is good. Saying "99% sure" and being wrong
is catastrophic. Saying "55% sure" either way barely moves anything — which is
correct, because you barely claimed anything. This is the **Brier score**, the
same measure used to evaluate professional forecasters, computed by the
contract itself.

Your bond settles on the same curve:

- Beat a coin flip and the bond comes back **plus up to 20%**, paid from the
  slashed bonds of worse forecasters.
- Do worse than a coin flip and up to **60%** is slashed into that pot.

Money flows from the miscalibrated to the calibrated, with no house in the
middle taking a cut.

## The invisible part

Everything above could run on any chain. What cannot: on a normal chain the
deposit itself doxxes you. Pay a bond from your wallet and the world sees who
you are, how big your bank is, and every other position you hold — which is
precisely the information a professional cannot leak.

On Xence the bond comes out of the **STRK20 shielded pool**. Outside observers
see that *someone* bonded a forecast; they cannot see who, from which wallet,
or what else that wallet holds. Your entire public existence is one
pseudonymous key and the track record attached to it.

Reputation without identity. Skin in the game without exposure. That is the
whole trick.
