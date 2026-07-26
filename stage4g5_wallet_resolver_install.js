const fs = require("fs");
const path = require("path");

console.log(`
================================================================================
CABLINK STAGE 4G.5 — CANONICAL WALLET RESOLVER IMPLEMENTATION
================================================================================
`);

const resolverPath = path.join(
  process.cwd(),
  "backend",
  "rewards",
  "canonical_wallet_resolver.js"
);

const rewardServicePath = path.join(
  process.cwd(),
  "backend",
  "services",
  "canonical_reward_service.js"
);

if (!fs.existsSync(rewardServicePath)) {
  throw new Error(
    "BLOCKED: backend/services/canonical_reward_service.js was not found."
  );
}

/*
 * --------------------------------------------------------------------------
 * 1. CREATE AUTHORITATIVE WALLET RESOLVER
 * --------------------------------------------------------------------------
 */

const resolverSource = `'use strict';

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const DRIVERS_FILE = path.join(__dirname, '..', 'data', 'drivers.json');
const DRIVERS_LIVE_FILE = path.join(__dirname, '..', 'data', 'drivers_live.json');

const PLACEHOLDER_WALLETS = new Set([
  'TEST-WALLET',
  'API-TEST-WALLET',
  'PILOT-TEST-WALLET',
  'TEST_WALLET',
  'API_TEST_WALLET',
  'PILOT_TEST_WALLET',
  'PLACEHOLDER',
  'PLACEHOLDER-WALLET',
  'YOUR-WALLET',
  'YOUR_WALLET',
  'NULL',
  'UNDEFINED'
]);

function normaliseIdentity(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value).trim();

  return result.length ? result : null;
}

function isPlaceholderWallet(value) {
  if (typeof value !== 'string') {
    return true;
  }

  const normalised = value.trim().toUpperCase();

  if (!normalised) {
    return true;
  }

  if (PLACEHOLDER_WALLETS.has(normalised)) {
    return true;
  }

  if (
    normalised.includes('TEST-WALLET') ||
    normalised.includes('TEST_WALLET') ||
    normalised.includes('PILOT-TEST') ||
    normalised.includes('PLACEHOLDER')
  ) {
    return true;
  }

  return false;
}

function validateWallet(value) {
  if (isPlaceholderWallet(value)) {
    return null;
  }

  const wallet = String(value).trim();

  if (!ethers.isAddress(wallet)) {
    return null;
  }

  return ethers.getAddress(wallet);
}

function readJson(file) {
  try {
    if (!fs.existsSync(file)) {
      return [];
    }

    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function findWalletInRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const candidates = [
    record.wallet,
    record.walletAddress,
    record.wallet_address,
    record.address
  ];

  for (const candidate of candidates) {
    const validWallet = validateWallet(candidate);

    if (validWallet) {
      return validWallet;
    }
  }

  return null;
}

function findLinkedWallet(identity) {
  const id = normaliseIdentity(identity);

  if (!id) {
    return null;
  }

  const sources = [
    readJson(USERS_FILE),
    readJson(DRIVERS_FILE),
    readJson(DRIVERS_LIVE_FILE)
  ];

  for (const records of sources) {
    for (const record of records) {
      if (!record || typeof record !== 'object') {
        continue;
      }

      if (
        String(record.id || '').trim() === id ||
        String(record.userId || '').trim() === id ||
        String(record.driverId || '').trim() === id
      ) {
        const wallet = findWalletInRecord(record);

        if (wallet) {
          return wallet;
        }
      }
    }
  }

  return null;
}

/**
 * Canonical wallet resolution.
 *
 * Identity -> linked wallet -> validation -> canonical address
 *
 * Returns null when:
 * - identity is missing
 * - no linked wallet exists
 * - wallet is a placeholder
 * - wallet is not a valid EVM address
 *
 * The treasury wallet is deliberately NOT used as a fallback.
 */
function resolveWallet(identity, suppliedWallet) {
  const linkedWallet = findLinkedWallet(identity);

  if (linkedWallet) {
    return linkedWallet;
  }

  return validateWallet(suppliedWallet);
}

module.exports = {
  resolveWallet,
  validateWallet,
  isPlaceholderWallet,
  findLinkedWallet
};
`;

fs.writeFileSync(resolverPath, resolverSource, "utf8");

console.log("✓ Created:");
console.log("  backend/rewards/canonical_wallet_resolver.js");

/*
 * --------------------------------------------------------------------------
 * 2. BACKUP CANONICAL REWARD SERVICE
 * --------------------------------------------------------------------------
 */

const backupPath =
  rewardServicePath +
  ".stage4g5-backup-" +
  Date.now();

fs.copyFileSync(rewardServicePath, backupPath);

console.log("✓ Backup created:");
console.log("  " + path.basename(backupPath));

/*
 * --------------------------------------------------------------------------
 * 3. WIRE RESOLVER INTO CANONICAL REWARD SERVICE
 * --------------------------------------------------------------------------
 */

let rewardService = fs.readFileSync(rewardServicePath, "utf8");

const requireLine =
  'const canonicalWalletResolver = require("../rewards/canonical_wallet_resolver");';

if (!rewardService.includes(requireLine)) {
  rewardService =
    requireLine +
    "\n" +
    rewardService;
}

/*
 * Replace only the direct canonical reward wallet assignment.
 *
 * Old:
 *   wallet: ride.wallet ||
 *
 * New:
 *   wallet: canonical resolver result
 *
 * We intentionally do not modify reward amount, ride logic,
 * blockchain executor, contract address, or ABI.
 */

const oldPattern =
  /wallet:\s*ride\.wallet\s*\|\|\s*([\s\S]*?)(?=\n\s*};)/;

if (oldPattern.test(rewardService)) {
  rewardService = rewardService.replace(
    oldPattern,
    `wallet: canonicalWalletResolver.resolveWallet(
      ride.driverId || ride.userId,
      ride.wallet
    )`
  );
} else {
  console.log(
    "⚠ Direct wallet assignment pattern was not found."
  );
  console.log(
    "  Resolver file was created, but canonical reward service was NOT modified."
  );
}

fs.writeFileSync(rewardServicePath, rewardService, "utf8");

console.log("✓ Canonical reward service processed");

/*
 * --------------------------------------------------------------------------
 * 4. VERIFICATION TESTS
 * --------------------------------------------------------------------------
 */

console.log(`
================================================================================
STAGE 4G.5 — RESOLVER VERIFICATION
================================================================================
`);

const resolver = require(resolverPath);

const tests = [
  {
    name: "Reject TEST-WALLET",
    identity: "TEST-DRIVER-001",
    wallet: "TEST-WALLET",
    expectNull: true
  },
  {
    name: "Reject API-TEST-WALLET",
    identity: "TEST-DRIVER-001",
    wallet: "API-TEST-WALLET",
    expectNull: true
  },
  {
    name: "Reject PILOT-TEST-WALLET",
    identity: "TEST-DRIVER-001",
    wallet: "PILOT-TEST-WALLET",
    expectNull: true
  },
  {
    name: "Reject malformed wallet",
    identity: "TEST-DRIVER-001",
    wallet: "not-a-wallet",
    expectNull: true
  },
  {
    name: "Reject empty wallet",
    identity: "TEST-DRIVER-001",
    wallet: null,
    expectNull: true
  },
  {
    name: "Accept valid EVM wallet",
    identity: "UNKNOWN-DRIVER",
    wallet: "0xaf2f749ea89b3aa9a2d2028dba4004cb3c615628",
    expectNull: false
  },
  {
    name: "Do not use treasury wallet as automatic fallback",
    identity: "UNKNOWN-DRIVER",
    wallet: null,
    expectNull: true
  }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  let result = null;

  try {
    result = resolver.resolveWallet(
      test.identity,
      test.wallet
    );
  } catch (error) {
    result = null;
  }

  const isNull = result === null;
  const success = test.expectNull
    ? isNull
    : !isNull && resolver.validateWallet(result);

  if (success) {
    passed++;
    console.log("✓ PASS:", test.name);
    console.log("  Result:", result);
  } else {
    failed++;
    console.log("✗ FAIL:", test.name);
    console.log("  Result:", result);
  }
}

/*
 * --------------------------------------------------------------------------
 * 5. STATIC SAFETY CHECK
 * --------------------------------------------------------------------------
 */

const updatedRewardService =
  fs.readFileSync(rewardServicePath, "utf8");

const resolverWired =
  updatedRewardService.includes(
    'require("../rewards/canonical_wallet_resolver")'
  );

const directUnsafeAssignment =
  /wallet:\s*ride\.wallet\s*\|\|/.test(updatedRewardService);

console.log(`
================================================================================
STAGE 4G.5 — STATIC SAFETY RESULTS
================================================================================
`);

console.log(
  resolverWired
    ? "✓ Canonical resolver import detected"
    : "✗ Canonical resolver import NOT detected"
);

console.log(
  !directUnsafeAssignment
    ? "✓ Direct ride.wallet fallback pattern not detected"
    : "✗ Direct ride.wallet fallback pattern STILL detected"
);

console.log(`
================================================================================
STAGE 4G.5 — FINAL RESULT
================================================================================
`);

console.log("Tests passed:", passed);
console.log("Tests failed:", failed);

if (
  failed === 0 &&
  resolverWired &&
  !directUnsafeAssignment
) {
  console.log(`
✓ STAGE 4G.5 PASSED

Canonical wallet resolution is installed.

Identity
  ↓
Canonical Wallet Resolver
  ↓
Linked wallet / supplied wallet
  ↓
Placeholder rejection
  ↓
ethers.isAddress() validation
  ↓
Canonical EVM address or null

No treasury-wallet fallback was introduced.
No frontend files were modified.
No ride booking files were modified.
No fare logic was modified.
No THB contract or ABI was modified.
No blockchain executor was modified.
`);
} else {
  console.log(`
✗ STAGE 4G.5 REQUIRES REVIEW

The resolver was created, but one or more verification checks failed.

DO NOT proceed to blockchain transfer testing until the failure is reviewed.
`);
  process.exitCode = 1;
}

console.log(`
================================================================================
`);
