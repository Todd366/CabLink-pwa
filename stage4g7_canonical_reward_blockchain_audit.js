const fs = require("fs");
const path = require("path");

console.log(`
================================================================================
CABLINK STAGE 4G.7 — CANONICAL REWARD → BLOCKCHAIN EXECUTION PATH AUDIT
================================================================================

READ-ONLY AUDIT
NO FILES WILL BE MODIFIED
NO BLOCKCHAIN TRANSACTION WILL BE SENT
================================================================================
`);

const root = process.cwd();

const files = {
  canonicalRoute: path.join(
    root,
    "backend/routes/canonical_reward_api.js"
  ),

  canonicalService: path.join(
    root,
    "backend/services/canonical_reward_service.js"
  ),

  realExecutor: path.join(
    root,
    "backend/blockchain/thb_real_executor.js"
  ),

  rewardEngine: path.join(
    root,
    "backend/rewards/reward_engine.js"
  ),

  rewardApi: path.join(
    root,
    "backend/api/reward_api.js"
  ),

  transferWorker: path.join(
    root,
    "backend/blockchain/thb_transfer_worker.js"
  ),

  transferService: path.join(
    root,
    "backend/blockchain/thb_transfer_service.js"
  ),

  transactionEngine: path.join(
    root,
    "backend/blockchain/thb_transaction_engine.js"
  ),

  transferQueue: path.join(
    root,
    "backend/rewards/thb_transfer_queue.js"
  ),

  serverApp: path.join(
    root,
    "backend/server/app.js"
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

function loadSource(file) {
  if (!fs.existsSync(file)) {
    return null;
  }

  return fs.readFileSync(file, "utf8");
}

function showSection(title) {
  console.log(`
================================================================================
${title}
================================================================================
`);
}

/*
 * ============================================================================
 * 1. FILE EXISTENCE
 * ============================================================================
 */

showSection("1. REQUIRED FILES");

for (const [name, file] of Object.entries(files)) {
  check(
    name + " exists",
    fs.existsSync(file),
    file
  );
}

/*
 * ============================================================================
 * 2. LOAD CANONICAL MODULES
 * ============================================================================
 */

showSection("2. CANONICAL MODULE LOAD");

let canonicalService = null;
let canonicalRoute = null;
let realExecutor = null;
let rewardEngine = null;
let rewardApi = null;

try {
  canonicalService =
    require(files.canonicalService);

  console.log(
    "✓ canonical_reward_service loaded"
  );

  console.log(
    "  Exports:",
    Object.keys(canonicalService)
  );
} catch (error) {
  console.log(
    "✗ canonical_reward_service failed:",
    error.message
  );

  failed++;
}

try {
  canonicalRoute =
    require(files.canonicalRoute);

  console.log(
    "✓ canonical_reward_api loaded"
  );

  console.log(
    "  Export type:",
    typeof canonicalRoute
  );
} catch (error) {
  console.log(
    "✗ canonical_reward_api failed:",
    error.message
  );

  failed++;
}

try {
  realExecutor =
    require(files.realExecutor);

  console.log(
    "✓ thb_real_executor loaded"
  );

  console.log(
    "  Exports:",
    Object.keys(realExecutor)
  );
} catch (error) {
  console.log(
    "✗ thb_real_executor failed:",
    error.message
  );

  failed++;
}

try {
  rewardEngine =
    require(files.rewardEngine);

  console.log(
    "✓ reward_engine loaded"
  );

  console.log(
    "  Exports:",
    Object.keys(rewardEngine)
  );
} catch (error) {
  console.log(
    "✗ reward_engine failed:",
    error.message
  );

  failed++;
}

try {
  rewardApi =
    require(files.rewardApi);

  console.log(
    "✓ reward_api loaded"
  );

  console.log(
    "  Exports:",
    Object.keys(rewardApi)
  );
} catch (error) {
  console.log(
    "✗ reward_api failed:",
    error.message
  );

  failed++;
}

/*
 * ============================================================================
 * 3. CANONICAL REWARD SERVICE ANALYSIS
 * ============================================================================
 */

showSection("3. CANONICAL REWARD SERVICE ANALYSIS");

const canonicalServiceSource =
  loadSource(files.canonicalService) || "";

check(
  "Canonical reward function exists",
  typeof canonicalService.createRewardForCompletedRide === "function"
);

check(
  "Canonical resolver imported",
  canonicalServiceSource.includes(
    'require("../rewards/canonical_wallet_resolver")'
  )
);

check(
  "Canonical wallet resolver is used",
  canonicalServiceSource.includes(
    "canonicalWalletResolver.resolveWallet"
  )
);

check(
  "Canonical service does not directly import real executor",
  !canonicalServiceSource.includes(
    "thb_real_executor"
  )
);

check(
  "Canonical service does not directly import reward engine",
  !canonicalServiceSource.includes(
    "reward_engine"
  )
);

check(
  "Canonical service does not directly call transfer()",
  !/\.transfer\s*\(/.test(
    canonicalServiceSource
  )
);

check(
  "Canonical service does not directly call executeTransfer()",
  !/executeTransfer\s*\(/.test(
    canonicalServiceSource
  )
);

console.log(`
Canonical reward service blockchain linkage:

  Imports thb_real_executor:
    ${canonicalServiceSource.includes("thb_real_executor")}

  Imports reward_engine:
    ${canonicalServiceSource.includes("reward_engine")}

  Calls executeTransfer():
    ${/executeTransfer\s*\(/.test(canonicalServiceSource)}

  Calls contract/token transfer():
    ${/\.transfer\s*\(/.test(canonicalServiceSource)}
`);

/*
 * ============================================================================
 * 4. CANONICAL ROUTE ANALYSIS
 * ============================================================================
 */

showSection("4. CANONICAL API ROUTE ANALYSIS");

const canonicalRouteSource =
  loadSource(files.canonicalRoute) || "";

check(
  "Canonical route imports canonical reward service",
  canonicalRouteSource.includes(
    'require("../services/canonical_reward_service")'
  )
);

check(
  "Canonical route invokes createRewardForCompletedRide",
  canonicalRouteSource.includes(
    ".createRewardForCompletedRide("
  )
);

check(
  "Canonical route does not directly invoke executeTransfer",
  !/executeTransfer\s*\(/.test(
    canonicalRouteSource
  )
);

check(
  "Canonical route does not directly call transfer()",
  !/\.transfer\s*\(/.test(
    canonicalRouteSource
  )
);

console.log(`
Canonical route blockchain linkage:

  Calls canonical reward service:
    ${canonicalRouteSource.includes(".createRewardForCompletedRide(")}

  Calls executeTransfer():
    ${/executeTransfer\s*\(/.test(canonicalRouteSource)}

  Calls transfer():
    ${/\.transfer\s*\(/.test(canonicalRouteSource)}
`);

/*
 * ============================================================================
 * 5. REAL EXECUTOR ANALYSIS
 * ============================================================================
 */

showSection("5. REAL BLOCKCHAIN EXECUTOR ANALYSIS");

const realExecutorSource =
  loadSource(files.realExecutor) || "";

check(
  "Real executor exposes executeTransfer()",
  realExecutor &&
  typeof realExecutor.executeTransfer === "function"
);

check(
  "Real executor uses ethers",
  realExecutorSource.includes(
    'require("ethers")'
  )
);

check(
  "Real executor creates JsonRpcProvider",
  realExecutorSource.includes(
    "new ethers.JsonRpcProvider"
  )
);

check(
  "Real executor creates signer wallet",
  realExecutorSource.includes(
    "new ethers.Wallet"
  )
);

check(
  "Real executor creates token contract",
  realExecutorSource.includes(
    "new ethers.Contract"
  )
);

check(
  "Real executor calls contract.transfer()",
  /contract\.transfer\s*\(/.test(
    realExecutorSource
  )
);

check(
  "Real executor uses supplied recipient wallet",
  realExecutorSource.includes(
    "data.wallet"
  )
);

check(
  "Real executor requires treasury configuration",
  realExecutorSource.includes(
    "TREASURY"
  )
);

console.log(`
REAL EXECUTOR CONFIRMED:

  Function:
    executeTransfer()

  On-chain operation:
    contract.transfer(...)

  Recipient source:
    data.wallet

  Signer:
    Treasury/private-key controlled wallet
`);

/*
 * ============================================================================
 * 6. REWARD ENGINE ANALYSIS
 * ============================================================================
 */

showSection("6. LEGACY / SECONDARY REWARD ENGINE ANALYSIS");

const rewardEngineSource =
  loadSource(files.rewardEngine) || "";

check(
  "Reward engine exposes issue()",
  rewardEngine &&
  typeof rewardEngine.issue === "function"
);

check(
  "Reward engine creates ethers provider",
  rewardEngineSource.includes(
    "new ethers.JsonRpcProvider"
  )
);

check(
  "Reward engine creates signer",
  rewardEngineSource.includes(
    "new ethers.Wallet"
  )
);

check(
  "Reward engine creates contract",
  rewardEngineSource.includes(
    "new ethers.Contract"
  )
);

check(
  "Reward engine calls token.transfer()",
  /token\.transfer\s*\(/.test(
    rewardEngineSource
  )
);

check(
  "Reward engine waits for transaction",
  /tx\.wait\s*\(/.test(
    rewardEngineSource
  )
);

console.log(`
SECONDARY BLOCKCHAIN PATH:

  Function:
    issue(walletAddress, amount)

  On-chain operation:
    token.transfer(walletAddress, amount)

  Transaction confirmation:
    tx.wait()
`);

/*
 * ============================================================================
 * 7. REWARD API ANALYSIS
 * ============================================================================
 */

showSection("7. REWARD API → REAL EXECUTOR ANALYSIS");

const rewardApiSource =
  loadSource(files.rewardApi) || "";

check(
  "Reward API imports claim engine",
  rewardApiSource.includes(
    "thb_claim_engine"
  )
);

check(
  "Reward API imports real executor",
  rewardApiSource.includes(
    "thb_real_executor"
  )
);

check(
  "Reward API calls executeTransfer()",
  rewardApiSource.includes(
    "executor.executeTransfer("
  )
);

check(
  "Reward API passes wallet to executor",
  rewardApiSource.includes(
    "wallet,"
  )
);

console.log(`
Reward API linkage:

  claim engine:
    ${rewardApiSource.includes("thb_claim_engine")}

  real executor:
    ${rewardApiSource.includes("thb_real_executor")}

  executeTransfer():
    ${rewardApiSource.includes("executor.executeTransfer(")}
`);

/*
 * ============================================================================
 * 8. CROSS-FILE STATIC CALL GRAPH
 * ============================================================================
 */

showSection("8. STATIC EXECUTION GRAPH");

const allSources = {};

for (const [name, file] of Object.entries(files)) {
  allSources[name] =
    loadSource(file) || "";
}

const canonicalToExecutor =
  allSources.canonicalService.includes(
    "thb_real_executor"
  ) ||
  allSources.canonicalRoute.includes(
    "thb_real_executor"
  );

const canonicalToRewardEngine =
  allSources.canonicalService.includes(
    "reward_engine"
  ) ||
  allSources.canonicalRoute.includes(
    "reward_engine"
  );

const rewardApiToExecutor =
  allSources.rewardApi.includes(
    "thb_real_executor"
  ) &&
  allSources.rewardApi.includes(
    "executeTransfer("
  );

console.log(`
CANONICAL PATH:

POST /api/rewards/ride/:rideId
        ↓
canonical_reward_api.js
        ↓
createRewardForCompletedRide()
        ↓
canonical_reward_service.js
        ↓
canonical_wallet_resolver.resolveWallet()
        ↓
Reward record creation

Direct blockchain executor linkage:
  ${canonicalToExecutor ? "DETECTED" : "NOT DETECTED"}

Direct reward_engine linkage:
  ${canonicalToRewardEngine ? "DETECTED" : "NOT DETECTED"}


SEPARATE CLAIM PATH:

reward_api.js
        ↓
thb_claim_engine.js
        ↓
thb_real_executor.js
        ↓
executeTransfer()
        ↓
contract.transfer()

Reward API → Real Executor:
  ${rewardApiToExecutor ? "DETECTED" : "NOT DETECTED"}
`);

/*
 * ============================================================================
 * 9. QUEUE / WORKER PATH ANALYSIS
 * ============================================================================
 */

showSection("9. TRANSFER QUEUE / WORKER ANALYSIS");

const workerSource =
  allSources.transferWorker;

const transferServiceSource =
  allSources.transferService;

const transactionEngineSource =
  allSources.transactionEngine;

const transferQueueSource =
  allSources.transferQueue;

console.log(`
Transfer worker:

  processReward() exported:
    ${workerSource.includes("processReward")}

  executeTransfer referenced:
    ${workerSource.includes("executeTransfer")}

  reward_engine referenced:
    ${workerSource.includes("reward_engine")}

  real executor referenced:
    ${workerSource.includes("thb_real_executor")}


Transfer service:

  transfer() exported:
    ${transferServiceSource.includes("function transfer")}

  contract.transfer() referenced:
    ${/contract\.transfer\s*\(/.test(transferServiceSource)}


Transaction engine:

  wallet:data.wallet:
    ${transactionEngineSource.includes("wallet:data.wallet")}

  transfer referenced:
    ${transactionEngineSource.includes("transfer")}


Transfer queue:

  queueReward() exported:
    ${transferQueueSource.includes("queueReward")}

  wallet:data.wallet:
    ${transferQueueSource.includes("wallet:data.wallet")}
`);

/*
 * ============================================================================
 * 10. SERVER ROUTE REGISTRATION
 * ============================================================================
 */

showSection("10. SERVER ROUTE REGISTRATION");

const serverSource =
  allSources.serverApp;

check(
  "Canonical reward routes registered",
  serverSource.includes(
    'app.use("/api/rewards",canonicalRewardRoutes)'
  )
);

console.log(`
Canonical endpoint:

  /api/rewards/*
  
Registered:
  ${serverSource.includes('app.use("/api/rewards",canonicalRewardRoutes)')}
`);

/*
 * ============================================================================
 * 11. FINAL ARCHITECTURE DETERMINATION
 * ============================================================================
 */

showSection("11. STAGE 4G.7 FINAL DETERMINATION");

const canonicalRewardCreationConfirmed =
  canonicalRouteSource.includes(
    ".createRewardForCompletedRide("
  ) &&
  canonicalServiceSource.includes(
    "canonicalWalletResolver.resolveWallet"
  );

const canonicalBlockchainTransferConfirmed =
  canonicalToExecutor ||
  canonicalToRewardEngine;

const separateBlockchainPathConfirmed =
  rewardApiToExecutor;

console.log(`
Canonical reward creation:
  ${canonicalRewardCreationConfirmed
    ? "CONFIRMED"
    : "NOT CONFIRMED"}

Canonical reward → blockchain transfer:
  ${canonicalBlockchainTransferConfirmed
    ? "DIRECT LINK DETECTED"
    : "NO DIRECT LINK DETECTED"}

Separate reward API → blockchain transfer:
  ${separateBlockchainPathConfirmed
    ? "CONFIRMED"
    : "NOT CONFIRMED"}
`);

if (
  canonicalRewardCreationConfirmed &&
  !canonicalBlockchainTransferConfirmed &&
  separateBlockchainPathConfirmed
) {
  console.log(`
================================================================================
✓ STAGE 4G.7 RESULT — ARCHITECTURE GAP CONFIRMED
================================================================================

The canonical reward system successfully creates the reward record and
resolves a valid recipient wallet.

However, the canonical reward creation path does NOT directly invoke the
real blockchain executor.

A separate blockchain claim path exists:

  reward_api.js
      ↓
  thb_claim_engine.js
      ↓
  thb_real_executor.js
      ↓
  contract.transfer()

Therefore:

  CANONICAL REWARD CREATION
          ≠
  BLOCKCHAIN SETTLEMENT

The system currently has separate reward creation and blockchain execution
paths.

NO BLOCKCHAIN TRANSACTION WAS SENT.

NEXT SAFE STEP:

Design and implement a single canonical settlement bridge that connects the
canonical reward record to the blockchain executor while preserving:

  ✓ canonical wallet resolver
  ✓ exactly-once reward creation
  ✓ duplicate protection
  ✓ transaction state tracking
  ✓ recipient validation
  ✓ treasury signer isolation
  ✓ BSC Testnet-only execution
  ✓ transaction hash persistence
  ✓ failure recovery

DO NOT connect the executor blindly until the settlement state machine is
defined.
================================================================================
`);
} else if (
  canonicalRewardCreationConfirmed &&
  canonicalBlockchainTransferConfirmed
) {
  console.log(`
================================================================================
⚠ STAGE 4G.7 RESULT — DIRECT BLOCKCHAIN LINK DETECTED
================================================================================

The canonical reward path appears to have a direct blockchain execution
connection.

Before sending any transaction, perform a transaction-level dry run and
verify:

  1. Exact recipient
  2. Exact THB amount
  3. Contract address
  4. Chain ID
  5. Treasury signer
  6. Duplicate protection
  7. Transaction persistence
  8. Receipt handling

NO BLOCKCHAIN TRANSACTION WAS SENT.
================================================================================
`);
} else {
  console.log(`
================================================================================
⚠ STAGE 4G.7 RESULT — MANUAL REVIEW REQUIRED
================================================================================

The expected canonical reward path could not be fully established from the
static inspection.

Review the detailed results above.

NO BLOCKCHAIN TRANSACTION WAS SENT.
================================================================================
`);
}

console.log(`
================================================================================
STAGE 4G.7 COMPLETE — READ ONLY
================================================================================
`);
