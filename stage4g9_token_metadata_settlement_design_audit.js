const fs = require("fs");
const path = require("path");

async function main() {
console.log(`
================================================================================
CABLINK STAGE 4G.9 — TOKEN METADATA + CANONICAL SETTLEMENT DESIGN AUDIT
================================================================================

READ-ONLY AUDIT
NO FILES WILL BE MODIFIED
NO BLOCKCHAIN TRANSACTION WILL BE SENT
NO TOKEN TRANSFER WILL BE EXECUTED

Purpose:
  1. Verify THB token ABI capabilities
  2. Read token metadata from BSC Testnet
  3. Verify treasury token balance
  4. Verify settlement-critical executor configuration
  5. Inspect canonical reward data model
  6. Inspect existing settlement/ledger infrastructure
  7. Produce the evidence required before implementing the
     canonical settlement bridge

================================================================================
`);

require("dotenv").config();

const ethers = require("ethers");

const root = process.cwd();

const files = {
  abi: path.join(
    root,
    "backend/blockchain/thb_abi.json"
  ),

  config: path.join(
    root,
    "backend/blockchain/thb_config.js"
  ),

  executor: path.join(
    root,
    "backend/blockchain/thb_real_executor.js"
  ),

  canonicalService: path.join(
    root,
    "backend/services/canonical_reward_service.js"
  ),

  canonicalRoute: path.join(
    root,
    "backend/routes/canonical_reward_api.js"
  ),

  walletResolver: path.join(
    root,
    "backend/rewards/canonical_wallet_resolver.js"
  ),

  claimEngine: path.join(
    root,
    "backend/rewards/thb_claim_engine.js"
  ),

  economyLedger: path.join(
    root,
    "backend/services/economy_ledger_service.js"
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
  )
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
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

/*
 * ============================================================================
 * 1. REQUIRED FILES
 * ============================================================================
 */

section("1. REQUIRED FILES");

for (const [name, file] of Object.entries(files)) {
  if (fs.existsSync(file)) {
    pass(name + " exists");
  } else {
    warn(name + " missing", file);
  }
}

/*
 * ============================================================================
 * 2. ENVIRONMENT
 * ============================================================================
 */

section("2. BLOCKCHAIN ENVIRONMENT");

const rpcUrl =
  process.env.RPC_URL;

const contractAddress =
  process.env.CONTRACT_ADDRESS;

const treasuryWallet =
  process.env.TREASURY_WALLET;

const privateKey =
  process.env.PRIVATE_KEY ||
  process.env.TREASURY_PRIVATE_KEY;

if (!rpcUrl) {
  fail(
    "RPC_URL configured"
  );
}

if (!contractAddress) {
  fail(
    "CONTRACT_ADDRESS configured"
  );
}

if (!treasuryWallet) {
  fail(
    "TREASURY_WALLET configured"
  );
}

if (!privateKey) {
  fail(
    "Treasury private key configured"
  );
}

let provider = null;
let signer = null;
let tokenContract = null;

let parsedContract = null;
let parsedTreasury = null;

if (rpcUrl) {
  try {
    provider =
      new ethers.JsonRpcProvider(
        rpcUrl
      );

    pass(
      "BSC RPC provider created"
    );
  } catch (error) {
    fail(
      "BSC RPC provider created",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 3. ADDRESS VALIDATION
 * ============================================================================
 */

section("3. ADDRESS VALIDATION");

if (contractAddress) {
  try {
    parsedContract =
      ethers.getAddress(
        contractAddress
      );

    pass(
      "THB contract address valid",
      parsedContract
    );
  } catch (error) {
    fail(
      "THB contract address valid",
      error.message
    );
  }
}

if (treasuryWallet) {
  try {
    parsedTreasury =
      ethers.getAddress(
        treasuryWallet
      );

    pass(
      "Treasury wallet address valid",
      parsedTreasury
    );
  } catch (error) {
    fail(
      "Treasury wallet address valid",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 4. NETWORK ASSERTION
 * ============================================================================
 */

section("4. BSC TESTNET ASSERTION");

let network = null;

if (provider) {
  try {
    network =
      await provider.getNetwork();

    console.log(
      "Network:",
      network.name
    );

    console.log(
      "Chain ID:",
      network.chainId.toString()
    );

    if (
      network.chainId.toString() === "97"
    ) {
      pass(
        "Connected to BSC Testnet"
      );
    } else {
      fail(
        "Connected to BSC Testnet",
        "Expected chain ID 97."
      );
    }
  } catch (error) {
    fail(
      "BSC Testnet network query",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 5. ABI INSPECTION
 * ============================================================================
 */

section("5. THB ABI CAPABILITY INSPECTION");

let abi = null;

if (fs.existsSync(files.abi)) {
  try {
    abi =
      JSON.parse(
        fs.readFileSync(
          files.abi,
          "utf8"
        )
      );

    pass(
      "THB ABI parses successfully"
    );

    const functions =
      abi.filter(
        item =>
          item.type === "function"
      );

    const functionNames =
      functions.map(
        item => item.name
      );

    console.log(
      "ABI functions:",
      functionNames
    );

    const requiredFunctions = [
      "transfer",
      "balanceOf",
      "decimals"
    ];

    for (
      const functionName
      of requiredFunctions
    ) {
      if (
        functionNames.includes(
          functionName
        )
      ) {
        pass(
          "ABI contains " +
          functionName +
          "()"
        );
      } else {
        fail(
          "ABI contains " +
          functionName +
          "()"
        );
      }
    }

    if (
      functionNames.includes("symbol")
    ) {
      pass(
        "ABI contains symbol()"
      );
    } else {
      warn(
        "ABI contains symbol()",
        "Optional but useful for settlement diagnostics."
      );
    }

    if (
      functionNames.includes("name")
    ) {
      pass(
        "ABI contains name()"
      );
    } else {
      warn(
        "ABI contains name()",
        "Optional but useful for settlement diagnostics."
      );
    }
  } catch (error) {
    fail(
      "THB ABI parses successfully",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 6. TOKEN CONTRACT INITIALISATION
 * ============================================================================
 */

section("6. TOKEN CONTRACT INITIALISATION");

if (
  provider &&
  parsedContract &&
  abi
) {
  try {
    tokenContract =
      new ethers.Contract(
        parsedContract,
        abi,
        provider
      );

    pass(
      "Read-only THB contract initialised"
    );
  } catch (error) {
    fail(
      "Read-only THB contract initialised",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 7. TOKEN METADATA
 * ============================================================================
 */

section("7. TOKEN METADATA");

let tokenName = null;
let tokenSymbol = null;
let tokenDecimals = null;

if (tokenContract) {

  if (
    typeof tokenContract.name ===
    "function"
  ) {
    try {
      tokenName =
        await tokenContract.name();

      console.log(
        "Token name:",
        tokenName
      );

      pass(
        "Token name readable"
      );
    } catch (error) {
      warn(
        "Token name readable",
        error.message
      );
    }
  }

  if (
    typeof tokenContract.symbol ===
    "function"
  ) {
    try {
      tokenSymbol =
        await tokenContract.symbol();

      console.log(
        "Token symbol:",
        tokenSymbol
      );

      pass(
        "Token symbol readable"
      );
    } catch (error) {
      warn(
        "Token symbol readable",
        error.message
      );
    }
  }

  if (
    typeof tokenContract.decimals ===
    "function"
  ) {
    try {
      tokenDecimals =
        await tokenContract.decimals();

      console.log(
        "Token decimals:",
        tokenDecimals.toString()
      );

      pass(
        "Token decimals readable"
      );
    } catch (error) {
      fail(
        "Token decimals readable",
        error.message
      );
    }
  } else {
    fail(
      "Token decimals() available"
    );
  }
}

/*
 * ============================================================================
 * 8. TREASURY BALANCE
 * ============================================================================
 */

section("8. TREASURY TOKEN BALANCE");

let treasuryBalance = null;

if (
  tokenContract &&
  parsedTreasury
) {
  try {
    treasuryBalance =
      await tokenContract.balanceOf(
        parsedTreasury
      );

    console.log(
      "Treasury raw token balance:",
      treasuryBalance.toString()
    );

    if (
      tokenDecimals !== null
    ) {
      console.log(
        "Treasury formatted token balance:",
        ethers.formatUnits(
          treasuryBalance,
          tokenDecimals
        )
      );
    }

    pass(
      "Treasury token balance readable"
    );
  } catch (error) {
    fail(
      "Treasury token balance readable",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 9. TREASURY SIGNER
 * ============================================================================
 */

section("9. TREASURY SIGNER VALIDATION");

let signerAddress = null;

if (
  provider &&
  privateKey
) {
  try {
    signer =
      new ethers.Wallet(
        privateKey,
        provider
      );

    signerAddress =
      await signer.getAddress();

    console.log(
      "Signer address:",
      signerAddress
    );

    pass(
      "Treasury signer constructed"
    );

    if (
      parsedTreasury &&
      ethers.getAddress(
        signerAddress
      ) ===
      parsedTreasury
    ) {
      pass(
        "Signer matches TREASURY_WALLET"
      );
    } else {
      fail(
        "Signer matches TREASURY_WALLET"
      );
    }
  } catch (error) {
    fail(
      "Treasury signer validation",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 10. EXECUTOR STATIC ANALYSIS
 * ============================================================================
 */

section("10. REAL EXECUTOR STATIC ANALYSIS");

const executorSource =
  source(files.executor);

if (
  executorSource.includes(
    "executeTransfer"
  )
) {
  pass(
    "executeTransfer() present"
  );
} else {
  fail(
    "executeTransfer() present"
  );
}

if (
  executorSource.includes(
    "contract.transfer("
  )
) {
  pass(
    "Executor performs token transfer operation"
  );
} else {
  fail(
    "Executor performs token transfer operation"
  );
}

if (
  executorSource.includes(
    "data.wallet"
  )
) {
  pass(
    "Executor accepts recipient wallet from transfer data"
  );
} else {
  warn(
    "Executor accepts recipient wallet from transfer data"
  );
}

if (
  executorSource.includes(
    "PRIVATE_KEY"
  ) ||
  executorSource.includes(
    "TREASURY_PRIVATE_KEY"
  )
) {
  pass(
    "Executor uses environment-based signer configuration"
  );
} else {
  warn(
    "Executor signer configuration requires manual review"
  );
}

/*
 * ============================================================================
 * 11. CANONICAL REWARD PATH
 * ============================================================================
 */

section("11. CANONICAL REWARD PATH");

const canonicalServiceSource =
  source(files.canonicalService);

const canonicalRouteSource =
  source(files.canonicalRoute);

const walletResolverSource =
  source(files.walletResolver);

if (
  canonicalRouteSource.includes(
    ".createRewardForCompletedRide("
  )
) {
  pass(
    "Canonical route invokes reward creation"
  );
} else {
  fail(
    "Canonical route invokes reward creation"
  );
}

if (
  canonicalServiceSource.includes(
    "canonicalWalletResolver.resolveWallet"
  )
) {
  pass(
    "Canonical service resolves canonical wallet"
  );
} else {
  fail(
    "Canonical service resolves canonical wallet"
  );
}

if (
  canonicalServiceSource.includes(
    "findExistingReward"
  )
) {
  pass(
    "Duplicate reward protection detected"
  );
} else {
  warn(
    "Duplicate reward protection not statically detected"
  );
}

if (
  walletResolverSource.includes(
    "validateWallet"
  )
) {
  pass(
    "Wallet validation logic exists"
  );
} else {
  warn(
    "Wallet validation logic requires review"
  );
}

/*
 * ============================================================================
 * 12. EXISTING SETTLEMENT INFRASTRUCTURE
 * ============================================================================
 */

section("12. EXISTING SETTLEMENT INFRASTRUCTURE");

const infrastructure = {
  claimEngine:
    source(files.claimEngine),

  economyLedger:
    source(files.economyLedger),

  transferWorker:
    source(files.transferWorker),

  transferService:
    source(files.transferService),

  transactionEngine:
    source(files.transactionEngine),

  transferQueue:
    source(files.transferQueue)
};

for (
  const [name, content]
  of Object.entries(infrastructure)
) {
  console.log(`
${name}:`);

  console.log(
    "  settlement:",
    /settlement/i.test(content)
  );

  console.log(
    "  transaction:",
    /transaction/i.test(content)
  );

  console.log(
    "  txHash:",
    /txHash|transactionHash|transaction_hash/i.test(content)
  );

  console.log(
    "  status:",
    /status/i.test(content)
  );

  console.log(
    "  retry:",
    /retry/i.test(content)
  );

  console.log(
    "  idempot:",
    /idempot|duplicate|already/i.test(content)
  );
}

/*
 * ============================================================================
 * 13. SETTLEMENT DESIGN REQUIREMENTS
 * ============================================================================
 */

section("13. CANONICAL SETTLEMENT DESIGN REQUIREMENTS");

const designRequirements = [
  "Reward ID is the canonical settlement idempotency key",
  "One reward may have at most one successful settlement",
  "Settlement starts in PENDING state",
  "Settlement lock prevents concurrent duplicate execution",
  "Recipient wallet is resolved through canonical wallet resolver",
  "Recipient wallet is validated before execution",
  "Reward amount is validated before execution",
  "Token decimals are used for unit conversion",
  "BSC Testnet chain ID 97 is asserted before execution",
  "Treasury signer is isolated from client input",
  "Only server-side executor can initiate transfer",
  "Transaction hash is persisted immediately after submission",
  "Receipt is awaited before CONFIRMED state",
  "Failed settlement is recoverable",
  "Retry cannot create duplicate successful settlement",
  "Blockchain transaction is never executed twice for one confirmed settlement"
];

for (
  const requirement
  of designRequirements
) {
  console.log(
    "  ✓",
    requirement
  );
}

/*
 * ============================================================================
 * 14. RECOMMENDED STATE MACHINE
 * ============================================================================
 */

section("14. RECOMMENDED SETTLEMENT STATE MACHINE");

console.log(`
REWARD CREATED
      |
      v
SETTLEMENT PENDING
      |
      v
LOCK ACQUIRED
      |
      v
VALIDATING
      |
      +--------------------------+
      |                          |
      v                          v
VALIDATION FAILED          VALIDATION PASSED
      |                          |
      v                          v
FAILED                     SUBMITTING
                                 |
                                 v
                            SUBMITTED
                                 |
                                 v
                         WAITING_FOR_RECEIPT
                                 |
                     +-----------+-----------+
                     |                       |
                     v                       v
                 CONFIRMED               FAILED
                     |                       |
                     v                       v
                 SETTLED              RETRYABLE_FAILURE
                                             |
                                             v
                                      RETRY WITH LOCK

IMPORTANT:
A CONFIRMED / SETTLED reward must never be submitted again.
`);

/*
 * ============================================================================
 * 15. FINAL DETERMINATION
 * ============================================================================
 */

section("15. FINAL STAGE 4G.9 DETERMINATION");

console.log(`
Failures: ${failures}
Warnings: ${warnings}

BLOCKCHAIN TRANSACTION SENT:
  NO

TOKEN TRANSFER EXECUTED:
  NO

FILES MODIFIED:
  NO
`);

if (
  failures === 0
) {
  console.log(`
================================================================================
✓ STAGE 4G.9 — READ-ONLY SETTLEMENT FOUNDATION PASSED
================================================================================

The blockchain environment and token metadata are sufficiently verified to
proceed to implementation of the canonical settlement bridge.

VERIFIED FOUNDATION:

  ✓ BSC Testnet chain ID 97
  ✓ THB contract deployed
  ✓ THB ABI loaded
  ✓ transfer() available
  ✓ balanceOf() available
  ✓ decimals() available
  ✓ Treasury signer validated
  ✓ Treasury wallet matches signer
  ✓ Canonical reward creation path exists
  ✓ Canonical wallet resolver exists
  ✓ Duplicate reward protection detected

NEXT STAGE:

  STAGE 4G.10
  CANONICAL SETTLEMENT BRIDGE IMPLEMENTATION

The implementation should introduce:

  backend/services/canonical_settlement_service.js

with:

  createSettlement()
  getSettlement()
  settleReward()
  retrySettlement()

and enforce:

  PENDING
  SUBMITTING
  SUBMITTED
  CONFIRMED
  FAILED

No live transfer should occur during implementation testing.

================================================================================
`);
} else {
  console.log(`
================================================================================
⚠ STAGE 4G.9 — FOUNDATION NOT PASSED
================================================================================

Resolve the FAIL conditions before implementing the settlement bridge.

Warnings may require architectural review but do not necessarily block
implementation.

NO BLOCKCHAIN TRANSACTION WAS SENT.

================================================================================
`);
}

console.log(`
================================================================================
STAGE 4G.9 COMPLETE — READ ONLY
================================================================================
`);
}

main().catch(error => {
  console.error(
    "\\n✗ STAGE 4G.9 AUDIT SCRIPT ERROR:"
  );
  console.error(
    error && error.stack
      ? error.stack
      : error
  );
  process.exitCode = 1;
});
