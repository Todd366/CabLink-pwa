const fs = require("fs");
const path = require("path");

console.log(`
================================================================================
CABLINK STAGE 4G.6 — BLOCKCHAIN REWARD TRANSFER PREFLIGHT
================================================================================
`);

const root = process.cwd();

const files = {
  rewardService: path.join(
    root,
    "backend",
    "services",
    "canonical_reward_service.js"
  ),
  resolver: path.join(
    root,
    "backend",
    "rewards",
    "canonical_wallet_resolver.js"
  )
};

let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log("✓ PASS:", name);
    if (detail) console.log("  " + detail);
  } else {
    console.log("✗ FAIL:", name);
    if (detail) console.log("  " + detail);
    failed++;
  }
}

console.log("\n[1] FILE EXISTENCE\n");

check(
  "Canonical wallet resolver exists",
  fs.existsSync(files.resolver),
  files.resolver
);

check(
  "Canonical reward service exists",
  fs.existsSync(files.rewardService),
  files.rewardService
);

if (failed > 0) {
  console.log(`
✗ PREFLIGHT BLOCKED

Required files are missing.
No blockchain transaction should be attempted.
`);
  process.exit(1);
}

console.log("\n[2] LOAD MODULES\n");

let resolver;
let rewardService;

try {
  resolver = require(files.resolver);
  console.log("✓ PASS: Canonical wallet resolver loaded");
} catch (error) {
  console.log("✗ FAIL: Canonical wallet resolver failed to load");
  console.log("  " + error.message);
  failed++;
}

try {
  rewardService = require(files.rewardService);
  console.log("✓ PASS: Canonical reward service loaded");
} catch (error) {
  console.log("✗ FAIL: Canonical reward service failed to load");
  console.log("  " + error.message);
  failed++;
}

console.log("\n[3] RESOLVER SAFETY\n");

if (resolver) {
  check(
    "Resolver exposes resolveWallet()",
    typeof resolver.resolveWallet === "function"
  );

  check(
    "Resolver exposes validateWallet()",
    typeof resolver.validateWallet === "function"
  );

  check(
    "Resolver rejects TEST-WALLET",
    resolver.resolveWallet(
      "PREFLIGHT-UNKNOWN-IDENTITY",
      "TEST-WALLET"
    ) === null
  );

  check(
    "Resolver rejects malformed wallet",
    resolver.resolveWallet(
      "PREFLIGHT-UNKNOWN-IDENTITY",
      "not-a-real-wallet"
    ) === null
  );

  check(
    "Resolver does not use treasury fallback",
    resolver.resolveWallet(
      "PREFLIGHT-UNKNOWN-IDENTITY",
      null
    ) === null
  );

  const knownTestWallet =
    "0xaf2f749ea89b3aa9a2d2028dba4004cb3c615628";

  const resolved =
    resolver.resolveWallet(
      "PREFLIGHT-UNKNOWN-IDENTITY",
      knownTestWallet
    );

  check(
    "Resolver accepts valid EVM wallet",
    resolved !== null,
    resolved || "null"
  );
}

console.log("\n[4] REWARD SERVICE STATIC INSPECTION\n");

const serviceSource =
  fs.readFileSync(files.rewardService, "utf8");

check(
  "Canonical resolver is imported",
  serviceSource.includes(
    'require("../rewards/canonical_wallet_resolver")'
  )
);

check(
  "Unsafe ride.wallet fallback is absent",
  !/wallet:\s*ride\.wallet\s*\|\|/.test(serviceSource)
);

const blockchainKeywords = [
  "ethers",
  "transfer",
  "transaction",
  "tx",
  "receipt",
  "blockchain"
];

const detectedKeywords =
  blockchainKeywords.filter(
    keyword =>
      serviceSource.toLowerCase().includes(keyword.toLowerCase())
  );

console.log(
  "  Blockchain-related references detected:",
  detectedKeywords.length
    ? detectedKeywords.join(", ")
    : "none"
);

console.log(`
================================================================================
STAGE 4G.6 — PREFLIGHT RESULT
================================================================================
`);

console.log("Checks failed:", failed);

if (failed === 0) {
  console.log(`
✓ STAGE 4G.6 PREFLIGHT PASSED

The reward service and canonical wallet resolver are loadable.
The wallet safety gate is active.

NEXT STEP:
Inspect the exact reward-service execution function before submitting
a real BSC Testnet transaction.

NO BLOCKCHAIN TRANSACTION WAS SENT.
`);
} else {
  console.log(`
✗ STAGE 4G.6 PREFLIGHT FAILED

DO NOT SEND A BLOCKCHAIN TRANSACTION.

Review the failed checks above first.
`);
  process.exitCode = 1;
}

console.log(`
================================================================================
`);
