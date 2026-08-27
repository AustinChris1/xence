import { NextResponse } from "next/server";
import { Account, RpcProvider, CallData } from "starknet";
import { PAYOUT_LIVE, REGISTRY_ADDRESS, RPC_URL } from "@/lib/config";

/**
 * Relay a signed payout announcement. `set_payout` is permissionless, so the
 * gas payer is deliberately not the forecaster: paying for it themselves would
 * publicly link their wallet to their reputation key.
 */

export const runtime = "nodejs";

type Body = {
  reputationKey: string;
  payout: string;
  signature: { r: string; s: string };
};

export async function POST(request: Request) {
  if (!PAYOUT_LIVE) {
    return NextResponse.json(
      { error: "Payout announcements need the payout registry, not declared yet." },
      { status: 503 },
    );
  }
  const ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS;
  const KEY = process.env.STARKNET_PRIVATE_KEY;
  if (!ADDRESS || !KEY || !REGISTRY_ADDRESS) {
    return NextResponse.json({ error: "Relay not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  for (const [name, v] of [
    ["reputationKey", body.reputationKey],
    ["payout", body.payout],
    ["signature.r", body.signature?.r],
    ["signature.s", body.signature?.s],
  ] as const) {
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(v ?? "")) {
      return NextResponse.json({ error: `${name} must be a felt.` }, { status: 400 });
    }
  }

  try {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const account = new Account({
      provider,
      address: ADDRESS,
      signer: KEY.startsWith("0x") ? KEY : `0x${KEY}`,
      cairoVersion: "1",
    });
    const { transaction_hash } = await account.execute({
      contractAddress: REGISTRY_ADDRESS,
      entrypoint: "set_payout",
      calldata: CallData.compile([
        body.reputationKey,
        body.payout,
        body.signature.r,
        body.signature.s,
      ]),
    });
    await provider.waitForTransaction(transaction_hash);
    return NextResponse.json({ tx: transaction_hash });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    // The one contract error a user can cause; everything else is the relay's problem.
    const friendly = /BAD_SIGNATURE/.test(raw)
      ? "Signature rejected: it must be made by the reputation key over (payout, current nonce)."
      : "Relay failed.";
    return NextResponse.json({ error: friendly, detail: raw.slice(0, 300) }, { status: 502 });
  }
}
