/**
 * Deploy Xence to Starknet.
 *
 *   node contracts/scripts/deploy.mjs
 *
 * Requires, in web/.env.local or the environment:
 *   STARKNET_ACCOUNT_ADDRESS   a funded account
 *   STARKNET_PRIVATE_KEY       its key — never commit this
 *   NEXT_PUBLIC_RPC_URL        your own RPC (Alchemy); the public one is
 *                              rate-limited and will fail mid-deploy
 *
 * Order matters. The vault needs the registry's address in its constructor, so
 * the registry goes first and the link back is closed afterwards with
 * `set_vault` — which is one-shot and then frozen, because a registry whose
 * writer can be swapped is a registry whose history can be rewritten.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Account,
  RpcProvider,
  CallData,
  json,
  ec,
  hash,
} from "../../web/node_modules/starknet/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const target = join(here, "..", "target", "dev");

/* ---------- env ---------- */

loadEnvFile(join(root, "web", ".env.local"));

const RPC =
  process.env.NEXT_PUBLIC_RPC_URL ??
  // Blast stopped serving Starknet; Cartridge is the keyless fallback.
  "https://api.cartridge.gg/x/starknet/mainnet";
const ADDRESS = required("STARKNET_ACCOUNT_ADDRESS");
const KEY = required("STARKNET_PRIVATE_KEY");

const POOL =
  process.env.NEXT_PUBLIC_POOL_ADDRESS ??
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";
const STRK_TOKEN =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const ORACLE =
  process.env.NEXT_PUBLIC_PRAGMA_ORACLE ??
  "0x2a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b";

/* ---------- resumable state ---------- */

// A run can die halfway (a declare that outgrows the balance, an RPC blip).
// Without this, the address of anything already deployed exists only in the
// scrollback, and the retry pays for it a second time — or worse, deploys a
// second copy and leaves the first orphaned holding funds.
const statePath = join(here, "..", "deployments.json");
const state = existsSync(statePath)
  ? JSON.parse(readFileSync(statePath, "utf8"))
  : { transactions: [] };

function remember(patch) {
  Object.assign(state, patch);
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
}

/* ---------- go ---------- */

const provider = new RpcProvider({ nodeUrl: RPC });
// starknet.js 10.x takes a single options object, and is V3-only — there is no
// TRANSACTION_VERSION constant to pass any more. `signer` accepts a raw key, but
// it must be 0x-prefixed: a bare 64-char hex string is parsed as decimal and
// silently yields a different (wrong) public key, so the signature fails
// validation on-chain with no hint as to why.
const SIGNER = KEY.startsWith("0x") ? KEY : `0x${KEY}`;
let accountDeployTx = null;

const account = new Account({
  provider,
  address: ADDRESS,
  signer: SIGNER,
  cairoVersion: "1",
});

await preflight();

const chainId = await provider.getChainId();
console.log(`chain     ${chainId}`);
console.log(`deployer  ${ADDRESS}`);
console.log(`pool      ${POOL}`);
console.log(`oracle    ${ORACLE}\n`);

const registry = state.registry
  ? (console.log(`registry  reusing ${state.registry}`), { address: state.registry, tx: null })
  : await deploy("xence_XenceRegistry", CallData.compile([ADDRESS]));
remember({ registry: registry.address });

const vault = state.vault
  ? (console.log(`vault     reusing ${state.vault}`), { address: state.vault, tx: null })
  : await deploy("xence_XenceVault", CallData.compile([POOL, registry.address, ORACLE]));
remember({ vault: vault.address });

console.log("\nlinking registry -> vault…");
const link = await account.execute({
  contractAddress: registry.address,
  entrypoint: "set_vault",
  calldata: CallData.compile([vault.address]),
});
await provider.waitForTransaction(link.transaction_hash);
console.log(`  ${link.transaction_hash}`);

/* ---------- record ---------- */

remember({
  chainId,
  deployedAt: new Date().toISOString(),
  pool: POOL,
  oracle: ORACLE,
  registry: registry.address,
  vault: vault.address,
  transactions: [
    ...new Set(
      [accountDeployTx, ...state.transactions, link.transaction_hash].filter(Boolean),
    ),
  ],
});

console.log("\n--- add to web/.env.local ---");
console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${registry.address}`);
console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vault.address}`);
console.log("\nwrote contracts/deployments.json");

/* ---------- helpers ---------- */

async function deploy(name, constructorCalldata) {
  const sierraPath = join(target, `${name}.contract_class.json`);
  const casmPath = join(target, `${name}.compiled_contract_class.json`);
  if (!existsSync(sierraPath)) {
    throw new Error(`${name} not built. Run: cd contracts && scarb build`);
  }

  const contract = json.parse(readFileSync(sierraPath, "utf8"));
  const casm = json.parse(readFileSync(casmPath, "utf8"));

  // Check affordability before sending. A declare that fails validation costs
  // nothing, but it also aborts the run — and if an earlier contract already
  // deployed, its address is only in the log unless we have written it down.
  const est = await account
    .estimateDeclareFee({ contract, casm }, { skipValidate: true })
    .catch(() => null);
  if (est) {
    const fee = BigInt(est.overall_fee ?? 0);
    const balance = await strkBalance();
    console.log(`  est. declare fee ${(Number(fee) / 1e18).toFixed(4)} STRK`);
    if (fee > balance) {
      fail([
        `Not enough STRK to declare ${name}.`,
        "",
        `  needed    ${(Number(fee) / 1e18).toFixed(4)} STRK`,
        `  available ${(Number(balance) / 1e18).toFixed(4)} STRK`,
        `  short by  ${(Number(fee - balance) / 1e18).toFixed(4)} STRK`,
        "",
        "  Declaring is priced by class size, and the vault is the largest",
        "  artifact here. Top the deployer up and re-run — anything already",
        "  declared or deployed is recorded in contracts/deployments.json and",
        "  will be reused rather than paid for twice.",
      ]);
    }
  }

  console.log(`declaring ${name}…`);
  // declareIfNot is idempotent: a class already on chain (a redeploy, or
  // someone else having declared identical bytecode) is not an error.
  const declared = await account.declareIfNot({ contract, casm });
  if (declared.transaction_hash) {
    await provider.waitForTransaction(declared.transaction_hash);
  }
  console.log(`  class ${declared.class_hash}`);

  console.log(`deploying ${name}…`);
  const deployed = await account.deployContract({
    classHash: declared.class_hash,
    constructorCalldata,
  });
  await provider.waitForTransaction(deployed.transaction_hash);
  console.log(`  at ${deployed.contract_address}`);

  state.transactions.push(deployed.transaction_hash);
  remember({});

  return {
    address: deployed.contract_address,
    classHash: declared.class_hash,
    tx: deployed.transaction_hash,
  };
}

/**
 * Fail before spending anything.
 *
 * Two failure modes are worth catching up front, because both otherwise show
 * up as an opaque error *after* a declare has already been paid for:
 *
 *  1. The account address holds funds but was never deployed. On Starknet an
 *     address exists counterfactually, so it can receive tokens long before
 *     the account contract behind it exists. Until it is deployed it cannot
 *     send anything.
 *  2. The account holds ETH but no STRK. Since v3 transactions, fees are paid
 *     in STRK — ETH sitting in the account does not help.
 */
async function strkBalance() {
  const res = await provider.callContract({
    contractAddress: STRK_TOKEN,
    entrypoint: "balanceOf",
    calldata: [ADDRESS],
  });
  return BigInt(res[0]) + (BigInt(res[1] ?? 0) << 128n);
}

async function preflight() {
  const short = `${ADDRESS.slice(0, 10)}…${ADDRESS.slice(-6)}`;
  const balance = await strkBalance();
  console.log(`balance   ${(Number(balance) / 1e18).toFixed(4)} STRK`);

  if (balance === 0n) {
    fail([
      `Account ${short} holds no STRK.`,
      "",
      "  Fees are paid in STRK on v3 transactions, so ETH in the account",
      "  will not cover this. Declaring the vault is the expensive step —",
      "  its Sierra class is the largest artifact here.",
    ]);
  }

  let deployed = true;
  try {
    await provider.getClassHashAt(ADDRESS);
  } catch {
    deployed = false;
  }
  if (deployed) return;

  // Not deployed, but funded — so we can deploy it ourselves. A DEPLOY_ACCOUNT
  // transaction is self-funding: the fee comes out of the account's own balance,
  // which is why the address has to be paid *before* it exists.
  //
  // Rather than trusting a configured class hash, work out which account
  // contract this address was actually derived from, by recomputing the address
  // for each known (class, constructor, salt) combination and keeping the one
  // that reproduces it. That is self-verifying: a wrong guess cannot match, and
  // deploying against a wrong guess would silently land at a different address
  // than the one holding the money.
  const pub = ec.starkCurve.getStarkKey(SIGNER);
  const recipe = identifyAccount(pub, ADDRESS);
  if (!recipe) {
    fail([
      `Account ${short} is not deployed, and its class could not be identified.`,
      "",
      "  The address does not match any known account contract derived from",
      "  this key, so deploying it from here would land somewhere else.",
      "  Deploy it from the wallet that owns it instead — any outgoing",
      "  transaction will do it.",
    ]);
  }

  console.log(`\naccount not deployed — deploying (${recipe.name})`);
  const { transaction_hash, contract_address } = await account.deployAccount({
    classHash: recipe.classHash,
    constructorCalldata: recipe.constructorCalldata,
    addressSalt: pub,
  });
  await provider.waitForTransaction(transaction_hash);

  if (BigInt(contract_address) !== BigInt(ADDRESS)) {
    fail([
      "Deployed account landed at a different address than configured.",
      `  expected ${ADDRESS}`,
      `  actual   ${contract_address}`,
    ]);
  }
  console.log(`  deployed  ${transaction_hash}`);
  accountDeployTx = transaction_hash;
}

/**
 * Work out which account contract an address was derived from.
 *
 * Starknet addresses are a hash of (salt, class hash, constructor calldata), so
 * the derivation can be replayed locally for each known wallet and checked
 * against the address we were given. Whichever one reproduces it is, by
 * construction, the right one — no configuration to get wrong.
 */
function identifyAccount(pub, address) {
  const target = BigInt(address);
  const CLASSES = {
    "Argent / Ready v0.4.0":
      "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
    "Argent v0.3.1":
      "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b",
    "Argent v0.3.0":
      "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
    "Braavos v1.0.0":
      "0x00816dd0297efc55dc1e7559020a3a825e81ef734b558f03c83325d4da7e6253",
    "OpenZeppelin v0.8.1":
      "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f",
  };
  // Argent v0.4 takes constructor(owner: Signer, guardian: Option<Signer>):
  // Signer::Starknet(pub) serialises as [0, pub], Option::None as [1].
  const SHAPES = [
    ["0", pub, "1"],
    [pub, "0"],
    [pub],
  ];

  for (const [name, classHash] of Object.entries(CLASSES)) {
    for (const constructorCalldata of SHAPES) {
      try {
        const derived = BigInt(
          hash.calculateContractAddressFromHash(pub, classHash, constructorCalldata, 0),
        );
        if (derived === target) return { name, classHash, constructorCalldata };
      } catch {
        /* combination is not valid for this class; keep looking */
      }
    }
  }
  return null;
}

function fail(lines) {
  const body = Array.isArray(lines) ? lines : [lines];
  console.error("");
  console.error(`✗ ${body[0]}`);
  for (const line of body.slice(1)) console.error(line);
  console.error("");
  process.exit(1);
}

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}.`);
    console.error("Copy web/.env.example to web/.env.local and fill it in.");
    process.exit(1);
  }
  return v;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env) && v) process.env[k] = v;
  }
}
