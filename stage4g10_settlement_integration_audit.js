const fs = require("fs");
const path = require("path");

async function main() {

console.log(`
================================================================================
CABLINK STAGE 4G.10 — SETTLEMENT + UI INTEGRATION AUDIT
================================================================================

READ-ONLY AUDIT
NO FILES WILL BE MODIFIED
NO BLOCKCHAIN TRANSACTION WILL BE SENT
NO TOKEN TRANSFER WILL BE EXECUTED

Purpose:
  1. Map the canonical reward architecture
  2. Inspect settlement-compatible interfaces
  3. Inspect blockchain executor contract
  4. Inspect wallet resolution contract
  5. Inspect persistence/ledger capabilities
  6. Inspect frontend reward UI
  7. Detect duplicate settlement systems
  8. Detect broken UI integration risks
  9. Produce an exact implementation map for Stage 4G.10

================================================================================
`);

require("dotenv").config();

const root = process.cwd();

const files = {
  canonicalService:
    "backend/services/canonical_reward_service.js",

  canonicalRoute:
    "backend/routes/canonical_reward_api.js",

  walletResolver:
    "backend/rewards/canonical_wallet_resolver.js",

  executor:
    "backend/blockchain/thb_real_executor.js",

  config:
    "backend/blockchain/thb_config.js",

  claimEngine:
    "backend/rewards/thb_claim_engine.js",

  economyLedger:
    "backend/services/economy_ledger_service.js",

  transferWorker:
    "backend/blockchain/thb_transfer_worker.js",

  transferService:
    "backend/blockchain/thb_transfer_service.js",

  transactionEngine:
    "backend/blockchain/thb_transaction_engine.js",

  transferQueue:
    "backend/rewards/thb_transfer_queue.js",

  index:
    "index.html",

  app:
    "frontend/js/app.js",

  core:
    "frontend/js/core.js",

  appCore:
    "frontend/js/app_core.js",

  appEngine:
    "frontend/js/app_engine.js",

  rewardUI:
    "frontend/js/rewards.js",

  walletUI:
    "frontend/js/wallet.js",

  thbWalletUI:
    "frontend/js/thb-wallet.js",

  styles:
    "frontend/css/style.css"
};

let failures = 0;
let warnings = 0;

function pass(name, detail = "") {
  console.log("✓ PASS:", name);
  if (detail) console.log("  " + detail);
}

function fail(name, detail = "") {
  console.log("✗ FAIL:", name);
  if (detail) console.log("  " + detail);
  failures++;
}

function warn(name, detail = "") {
  console.log("⚠ WARN:", name);
  if (detail) console.log("  " + detail);
  warnings++;
}

function section(title) {
  console.log(`
================================================================================
${title}
================================================================================
`);
}

function source(file) {
  try {
    return fs.readFileSync(
      path.join(root, file),
      "utf8"
    );
  } catch {
    return "";
  }
}

/*
===============================================================================
1. FILE MAP
===============================================================================
*/

section("1. EXISTING ARCHITECTURE FILE MAP");

for (const [name, file] of Object.entries(files)) {

  const full = path.join(root, file);

  if (fs.existsSync(full)) {
    pass(name + " exists", file);
  } else {
    warn(name + " missing", file);
  }

}

/*
===============================================================================
2. BACKEND EXPORT MAP
===============================================================================
*/

section("2. BACKEND MODULE EXPORT MAP");

const backendModules = [
  "canonicalService",
  "canonicalRoute",
  "walletResolver",
  "executor",
  "config",
  "claimEngine",
  "economyLedger",
  "transferWorker",
  "transferService",
  "transactionEngine",
  "transferQueue"
];

for (const name of backendModules) {

  const content = source(files[name]);

  if (!content) {
    continue;
  }

  console.log(`
${name}:`);

  const exports = [];

  const moduleExports =
    content.match(
      /module\.exports\s*=\s*\{[\s\S]*?\}/g
    ) || [];

  const namedExports =
    content.match(
      /exports\.[A-Za-z0-9_]+/g
    ) || [];

  for (const item of namedExports) {
    exports.push(item);
  }

  for (const item of moduleExports) {
    const matches =
      item.match(
        /[A-Za-z0-9_]+(?=\s*[,}])/g
      ) || [];

    exports.push(...matches);
  }

  console.log(
    "  Exports:",
    [...new Set(exports)]
  );
}

/*
===============================================================================
3. REWARD SERVICE INTERFACE
===============================================================================
*/

section("3. CANONICAL REWARD SERVICE INTERFACE");

const canonicalService =
  source(files.canonicalService);

const rewardFunctions = [
  "createRewardForCompletedRide",
  "findExistingReward",
  "getReward",
  "claimReward",
  "completeReward",
  "updateReward",
  "markReward"
];

for (const fn of rewardFunctions) {

  if (
    canonicalService.includes(fn)
  ) {
    pass(
      "Reward service references " + fn + "()"
    );
  }

}

/*
===============================================================================
4. EXECUTOR INTERFACE
===============================================================================
*/

section("4. BLOCKCHAIN EXECUTOR INTERFACE");

const executor =
  source(files.executor);

if (
  executor.includes("executeTransfer")
) {
  pass(
    "executeTransfer() exists"
  );
} else {
  fail(
    "executeTransfer() exists"
  );
}

if (
  executor.includes("contract.transfer")
) {
  pass(
    "Executor performs token transfer"
  );
} else {
  fail(
    "Executor performs token transfer"
  );
}

if (
  executor.includes("tx.hash") ||
  executor.includes(".hash")
) {
  pass(
    "Executor appears to expose transaction hash"
  );
} else {
  warn(
    "Executor transaction hash handling requires integration review"
  );
}

if (
  executor.includes("wait(")
) {
  pass(
    "Executor appears to support receipt waiting"
  );
} else {
  warn(
    "Executor receipt handling requires settlement-layer implementation"
  );
}

/*
===============================================================================
5. WALLET RESOLUTION
===============================================================================
*/

section("5. CANONICAL WALLET RESOLUTION");

const walletResolver =
  source(files.walletResolver);

for (const fn of [
  "resolveWallet",
  "validateWallet",
  "findLinkedWallet"
]) {

  if (
    walletResolver.includes(fn)
  ) {
    pass(
      fn + "() available"
    );
  } else {
    warn(
      fn + "() not statically detected"
    );
  }

}

/*
===============================================================================
6. PERSISTENCE / IDEMPOTENCY
===============================================================================
*/

section("6. PERSISTENCE + IDEMPOTENCY CAPABILITY");

const persistenceFiles = [
  "canonicalService",
  "claimEngine",
  "economyLedger",
  "transferWorker",
  "transferService",
  "transactionEngine",
  "transferQueue"
];

const persistencePatterns = [
  "rewardId",
  "reward_id",
  "txHash",
  "transactionHash",
  "transaction_hash",
  "status",
  "createdAt",
  "updatedAt",
  "duplicate",
  "already",
  "idempot",
  "lock",
  "pending",
  "retry"
];

for (const name of persistenceFiles) {

  const content =
    source(files[name]);

  if (!content) {
    continue;
  }

  console.log(`
${name}:`);

  for (const pattern of persistencePatterns) {

    if (
      new RegExp(
        pattern,
        "i"
      ).test(content)
    ) {
      console.log(
        "  ✓",
        pattern
      );
    }

  }

}

/*
===============================================================================
7. SETTLEMENT DUPLICATION RISK
===============================================================================
*/

section("7. SETTLEMENT DUPLICATION RISK");

const settlementFiles = [
  "claimEngine",
  "economyLedger",
  "transferWorker",
  "transferService",
  "transactionEngine",
  "transferQueue"
];

let settlementImplementations = 0;

for (const name of settlementFiles) {

  const content =
    source(files[name]);

  if (
    /transfer\s*\(/i.test(content) ||
    /executeTransfer/i.test(content) ||
    /transactionHash/i.test(content) ||
    /txHash/i.test(content)
  ) {

    console.log(
      "⚠ Potential blockchain/settlement logic:",
      name
    );

    settlementImplementations++;

  }

}

if (
  settlementImplementations > 1
) {
  warn(
    "Multiple settlement-capable modules detected",
    "Stage 4G.10 must establish ONE canonical settlement execution path."
  );
} else {
  pass(
    "No obvious competing settlement execution paths detected"
  );
}

/*
===============================================================================
8. FRONTEND FILE MAP
===============================================================================
*/

section("8. FRONTEND REWARD / WALLET UI");

const frontendFiles = [
  "index",
  "app",
  "core",
  "appCore",
  "appEngine",
  "rewardUI",
  "walletUI",
  "thbWalletUI"
];

let frontendRewardReferences = 0;

for (const name of frontendFiles) {

  const content =
    source(files[name]);

  if (!content) {
    continue;
  }

  const rewardHits =
    (
      content.match(
        /reward|THB|THoBoCoin|claim|wallet|transaction|txHash/gi
      ) || []
    ).length;

  if (
    rewardHits > 0
  ) {

    console.log(
      `${name}: ${rewardHits} reward/wallet references`
    );

    frontendRewardReferences += rewardHits;

  }

}

/*
===============================================================================
9. FRONTEND SETTLEMENT STATE SUPPORT
===============================================================================
*/

section("9. FRONTEND SETTLEMENT STATE SUPPORT");

const allFrontendSource =
  frontendFiles
    .map(
      name => source(files[name])
    )
    .join("\n");

const frontendStates = [
  "PENDING",
  "SUBMITTING",
  "SUBMITTED",
  "CONFIRMED",
  "FAILED",
  "SETTLED",
  "RETRY"
];

for (const state of frontendStates) {

  if (
    allFrontendSource.includes(state)
  ) {
    pass(
      "Frontend references " + state
    );
  } else {
    warn(
      "Frontend does not reference " + state,
      "UI state will need integration."
    );
  }

}

/*
===============================================================================
10. UI ACTION HEALTH
===============================================================================
*/

section("10. UI ACTION HEALTH");

const uiActions = [
  "bookRide",
  "requestRide",
  "toggleDriverMode",
  "acceptRide",
  "completeRide",
  "claimReward",
  "connectWallet"
];

for (const action of uiActions) {

  if (
    allFrontendSource.includes(action)
  ) {
    pass(
      action + "() reference detected"
    );
  } else {
    warn(
      action + "() reference not detected"
    );
  }

}

/*
===============================================================================
11. INLINE SCRIPT / EVENT HANDLER RISK
===============================================================================
*/

section("11. FRONTEND EVENT HANDLER RISK");

const indexSource =
  source(files.index);

if (
  indexSource
) {

  const inlineHandlers =
    (
      indexSource.match(
        /\bon(click|submit|change|input)\s*=/gi
      ) || []
    ).length;

  console.log(
    "Inline event handlers:",
    inlineHandlers
  );

  if (
    inlineHandlers > 0
  ) {
    warn(
      "Inline event handlers detected",
      "These require regression testing before UI integration."
    );
  } else {
    pass(
      "No inline event handlers detected"
    );
  }

}

/*
===============================================================================
12. NAVIGATION HEALTH
===============================================================================
*/

section("12. NAVIGATION HEALTH");

const navPatterns = [
  "navbar",
  "nav",
  "dashboard",
  "home",
  "rides",
  "wallet",
  "rewards",
  "driver"
];

let navHits = 0;

for (const pattern of navPatterns) {

  if (
    allFrontendSource
      .toLowerCase()
      .includes(pattern)
  ) {

    console.log(
      "✓ Navigation reference:",
      pattern
    );

    navHits++;

  }

}

if (
  navHits >= 3
) {
  pass(
    "Navigation structure detected"
  );
} else {
  warn(
    "Navigation structure requires manual UI verification"
  );
}

/*
===============================================================================
13. SETTLEMENT UI DESIGN CONTRACT
===============================================================================
*/

section("13. REQUIRED SETTLEMENT UI CONTRACT");

const requiredUI = [
  "Reward created state",
  "Settlement pending state",
  "Settlement processing state",
  "Transaction submitted state",
  "Confirmed reward state",
  "Failed settlement state",
  "Retry action",
  "Transaction hash link",
  "No duplicate settlement action",
  "Human-readable error messages",
  "Loading state during settlement",
  "Disabled action while settlement is processing",
  "Mobile responsive layout",
  "Existing navbar remains functional",
  "Existing booking flow remains functional",
  "Existing driver flow remains functional"
];

for (const item of requiredUI) {
  console.log(
    "  ✓",
    item
  );
}

/*
===============================================================================
14. IMPLEMENTATION BOUNDARY
===============================================================================
*/

section("14. STAGE 4G.10 IMPLEMENTATION BOUNDARY");

console.log(`
IMPLEMENT:

  backend/services/canonical_settlement_service.js

Expected responsibilities:

  createSettlement()
  getSettlement()
  settleReward()
  retrySettlement()

Settlement states:

  PENDING
  SUBMITTING
  SUBMITTED
  CONFIRMED
  FAILED

Required protections:

  1. Reward ID idempotency
  2. Exactly-once settlement lock
  3. Wallet resolution
  4. Wallet validation
  5. Amount validation
  6. Token decimal conversion
  7. Chain ID 97 assertion
  8. Treasury signer isolation
  9. Server-side execution only
  10. Transaction hash persistence
  11. Receipt confirmation
  12. Retry protection

UI requirements:

  1. Preserve current navigation
  2. Preserve booking
  3. Preserve driver mode
  4. Add settlement status
  5. Add clean loading states
  6. Add failure/retry states
  7. Add transaction hash visibility
  8. Prevent duplicate clicks
  9. Keep mobile layout healthy
  10. No raw secrets or backend errors exposed

IMPORTANT:

  NO LIVE TRANSACTION WILL BE SENT DURING INITIAL IMPLEMENTATION.
  NO TOKEN TRANSFER WILL BE EXECUTED DURING INITIAL IMPLEMENTATION.
  IMPLEMENTATION MUST FIRST PASS STATIC AND UNIT VALIDATION.
`);

/*
===============================================================================
15. FINAL DETERMINATION
===============================================================================
*/

section("15. FINAL STAGE 4G.10 PRE-IMPLEMENTATION DETERMINATION");

console.log(`
Failures: ${failures}
Warnings: ${warnings}

BLOCKCHAIN TRANSACTION SENT:
  NO

TOKEN TRANSFER EXECUTED:
  NO

FILES MODIFIED BY THIS AUDIT:
  NO
`);

if (
  failures === 0
) {

  console.log(`
================================================================================
✓ STAGE 4G.10 PRE-IMPLEMENTATION AUDIT COMPLETE
================================================================================

The repository has been mapped.

NEXT ACTION:

Implement the canonical settlement bridge against the ACTUAL interfaces
detected by this audit.

Do not create a competing reward or transfer system.

After backend implementation:

  1. Run static validation
  2. Run settlement unit tests
  3. Run UI regression checks
  4. Run frontend runtime smoke test
  5. Verify navbar
  6. Verify booking
  7. Verify driver flow
  8. Verify reward display
  9. Verify settlement status display
  10. Only then consider controlled Testnet execution

================================================================================
`);
} else {

  console.log(`
================================================================================
⚠ STAGE 4G.10 PRE-IMPLEMENTATION AUDIT REQUIRES REVIEW
================================================================================

Resolve FAIL conditions before implementation.

Warnings are architectural review points.

NO BLOCKCHAIN TRANSACTION WAS SENT.

================================================================================
`);
}

console.log(`
================================================================================
STAGE 4G.10 PRE-IMPLEMENTATION AUDIT COMPLETE
================================================================================
`);

}

main().catch(error => {
  console.error(
    "\\n✗ STAGE 4G.10 AUDIT SCRIPT ERROR:"
  );

  console.error(
    error && error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
});
