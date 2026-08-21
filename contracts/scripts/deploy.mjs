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
  constants,
} from "../../web/node_modules/starknet/dist/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const target = join(here, "..", "target", "dev");

/* ---------- env ---------- */

loadEnvFile(join(root, "web", ".env.local"));

const RPC =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://starknet-mainnet.public.blastapi.io/rpc/v0_9";
const ADDRESS = required("STARKNET_ACCOUNT_ADDRESS");
const KEY = required("STARKNET_PRIVATE_KEY");

const POOL =
  process.env.NEXT_PUBLIC_POOL_ADDRESS ??
  "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a";
const ORACLE =
  process.env.NEXT_PUBLIC_PRAGMA_ORACLE ??
  "0x2a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b";

/* ---------- go ---------- */

const provider = new RpcProvider({ nodeUrl: RPC });
const account = new Account(provider, ADDRESS, KEY, "1", constants.TRANSACTION_VERSION.V3);

const chainId = await provider.getChainId();
console.log(`chain     ${chainId}`);
console.log(`deployer  ${ADDRESS}`);
console.log(`pool      ${POOL}`);
console.log(`oracle    ${ORACLE}\n`);

const registry = await deploy("xence_XenceRegistry", CallData.compile([ADDRESS]));
const vault = await deploy(
  "xence_XenceVault",
  CallData.compile([POOL, registry.address, ORACLE]),
);

console.log("\nlinking registry -> vault…");
const link = await account.execute({
  contractAddress: registry.address,
  entrypoint: "set_vault",
  calldata: CallData.compile([vault.address]),
});
await provider.waitForTransaction(link.transaction_hash);
console.log(`  ${link.transaction_hash}`);

/* ---------- record ---------- */

const out = {
  chainId,
  deployedAt: new Date().toISOString(),
  pool: POOL,
  oracle: ORACLE,
  registry: registry.address,
  vault: vault.address,
  transactions: [registry.tx, vault.tx, link.transaction_hash].filter(Boolean),
};
writeFileSync(join(here, "..", "deployments.json"), JSON.stringify(out, null, 2) + "\n");

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

  return {
    address: deployed.contract_address,
    classHash: declared.class_hash,
    tx: deployed.transaction_hash,
  };
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
