async function main() {
const fs = require("fs");
const path = require("path");

console.log(`
================================================================================
CABLINK STAGE 4G.8 — BSC TESTNET SETTLEMENT PREFLIGHT
================================================================================

READ-ONLY PREFLIGHT
NO FILES WILL BE MODIFIED
NO BLOCKCHAIN TRANSACTION WILL BE SENT
NO TOKEN TRANSFER WILL BE EXECUTED

Purpose:
  Validate the environment, canonical reward path, wallet resolution,
  blockchain executor, BSC Testnet configuration, and settlement prerequisites
  before implementing the canonical settlement bridge.

================================================================================
`);

require("dotenv").config();

const root = process.cwd();

const files = {
  envExample: path.join(root, ".env.example"),
  env: path.join(root, ".env"),

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

  realExecutor: path.join(
    root,
    "backend/blockchain/thb_real_executor.js"
  ),

  config: path.join(
    root,
    "backend/blockchain/thb_config.js"
  ),

  claimEngine: path.join(
    root,
    "backend/rewards/thb_claim_engine.js"
  ),

  economyLedger: path.join(
    root,
    "backend/services/economy_ledger_service.js"
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
 * 1. DEPENDENCY CHECK
 * ============================================================================
 */

section("1. DEPENDENCY CHECK");

try {
  const dotenv = require("dotenv");
  pass("dotenv module available");
} catch (error) {
  fail("dotenv module unavailable", error.message);
}

try {
  const ethers = require("ethers");
  pass(
    "ethers module available",
    "Version: " + (ethers.version || "unknown")
  );
} catch (error) {
  fail("ethers module unavailable", error.message);
}

/*
 * ============================================================================
 * 2. REQUIRED FILE CHECK
 * ============================================================================
 */

section("2. REQUIRED FILES");

for (const [name, file] of Object.entries(files)) {
  if (fs.existsSync(file)) {
    pass(name + " exists", file);
  } else {
    warn(name + " missing", file);
  }
}

/*
 * ============================================================================
 * 3. ENVIRONMENT VARIABLE PRESENCE
 * ============================================================================
 */

section("3. BLOCKCHAIN ENVIRONMENT CONFIGURATION");

/*
 * IMPORTANT:
 * Never print private keys, seed phrases, or secrets.
 */

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const treasuryWallet = process.env.TREASURY_WALLET;
const privateKey =
  process.env.PRIVATE_KEY ||
  process.env.TREASURY_PRIVATE_KEY;

if (rpcUrl) {
  pass(
    "RPC_URL configured",
    "Value present; secret value not displayed."
  );
} else {
  fail(
    "RPC_URL configured",
    "RPC_URL is missing."
  );
}

if (contractAddress) {
  pass(
    "CONTRACT_ADDRESS configured",
    "Value present; address will be validated below."
  );
} else {
  fail(
    "CONTRACT_ADDRESS configured",
    "CONTRACT_ADDRESS is missing."
  );
}

if (treasuryWallet) {
  pass(
    "TREASURY_WALLET configured",
    "Value present; address will be validated below."
  );
} else {
  warn(
    "TREASURY_WALLET configured",
    "TREASURY_WALLET is not set."
  );
}

if (privateKey) {
  pass(
    "Treasury private key configured",
    "Private key present; secret value not displayed."
  );
} else {
  fail(
    "Treasury private key configured",
    "Neither PRIVATE_KEY nor TREASURY_PRIVATE_KEY is configured."
  );
}

/*
 * ============================================================================
 * 4. ADDRESS VALIDATION
 * ============================================================================
 */

section("4. EVM ADDRESS VALIDATION");

let ethers;

try {
  ethers = require("ethers");
} catch {}

let parsedContract = null;
let parsedTreasury = null;

if (ethers && contractAddress) {
  try {
    parsedContract = ethers.getAddress(contractAddress);
    pass(
      "CONTRACT_ADDRESS is valid",
      parsedContract
    );
  } catch (error) {
    fail(
      "CONTRACT_ADDRESS is valid",
      error.message
    );
  }
}

if (ethers && treasuryWallet) {
  try {
    parsedTreasury = ethers.getAddress(treasuryWallet);
    pass(
      "TREASURY_WALLET is valid",
      parsedTreasury
    );
  } catch (error) {
    fail(
      "TREASURY_WALLET is valid",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 5. EXECUTOR MODULE LOAD
 * ============================================================================
 */

section("5. REAL EXECUTOR LOAD");

let realExecutor = null;

try {
  realExecutor =
    require(files.realExecutor);

  pass(
    "thb_real_executor loads successfully"
  );

  console.log(
    "  Exports:",
    Object.keys(realExecutor)
  );

  if (
    typeof realExecutor.executeTransfer ===
    "function"
  ) {
    pass(
      "executeTransfer() exported"
    );
  } else {
    fail(
      "executeTransfer() exported"
    );
  }
} catch (error) {
  fail(
    "thb_real_executor loads successfully",
    error.message
  );
}

/*
 * ============================================================================
 * 6. CANONICAL REWARD SERVICE LOAD
 * ============================================================================
 */

section("6. CANONICAL REWARD SERVICE");

let canonicalService = null;

try {
  canonicalService =
    require(files.canonicalService);

  pass(
    "canonical_reward_service loads successfully"
  );

  if (
    typeof canonicalService
      .createRewardForCompletedRide ===
    "function"
  ) {
    pass(
      "createRewardForCompletedRide() exported"
    );
  } else {
    fail(
      "createRewardForCompletedRide() exported"
    );
  }
} catch (error) {
  fail(
    "canonical_reward_service loads successfully",
    error.message
  );
}

/*
 * ============================================================================
 * 7. WALLET RESOLVER
 * ============================================================================
 */

section("7. CANONICAL WALLET RESOLVER");

let walletResolver = null;

try {
  walletResolver =
    require(files.walletResolver);

  pass(
    "canonical_wallet_resolver loads successfully"
  );

  console.log(
    "  Exports:",
    Object.keys(walletResolver)
  );

  if (
    typeof walletResolver.resolveWallet ===
    "function"
  ) {
    pass(
      "resolveWallet() exported"
    );
  } else {
    fail(
      "resolveWallet() exported"
    );
  }

  if (
    typeof walletResolver.validateWallet ===
    "function"
  ) {
    pass(
      "validateWallet() exported"
    );
  } else {
    fail(
      "validateWallet() exported"
    );
  }
} catch (error) {
  fail(
    "canonical_wallet_resolver loads successfully",
    error.message
  );
}

/*
 * ============================================================================
 * 8. BSC TESTNET NETWORK PREFLIGHT
 * ============================================================================
 */

section("8. BSC TESTNET NETWORK PREFLIGHT");

let provider = null;
let network = null;

if (ethers && rpcUrl) {
  try {
    provider =
      new ethers.JsonRpcProvider(rpcUrl);

    network =
      await provider.getNetwork();

    console.log(
      "Network name:",
      network.name
    );

    console.log(
      "Chain ID:",
      network.chainId.toString()
    );

    if (
      network.chainId.toString() ===
      "97"
    ) {
      pass(
        "Connected network is BSC Testnet",
        "Chain ID 97"
      );
    } else {
      fail(
        "Connected network is BSC Testnet",
        "Detected chain ID: " +
        network.chainId.toString()
      );
    }
  } catch (error) {
    fail(
      "RPC connection successful",
      error.message
    );
  }
} else {
  fail(
    "Network preflight possible",
    "RPC_URL or ethers is unavailable."
  );
}

/*
 * ============================================================================
 * 9. CONTRACT CODE PREFLIGHT
 * ============================================================================
 */

section("9. TOKEN CONTRACT PREFLIGHT");

if (
  provider &&
  parsedContract
) {
  try {
    const code =
      await provider.getCode(
        parsedContract
      );

    if (
      code &&
      code !== "0x"
    ) {
      pass(
        "Contract address contains deployed code",
        "Contract detected on connected network."
      );
    } else {
      fail(
        "Contract address contains deployed code",
        "No contract bytecode found at configured address."
      );
    }
  } catch (error) {
    fail(
      "Contract code lookup successful",
      error.message
    );
  }
} else {
  warn(
    "Contract code check skipped",
    "Missing provider or valid contract address."
  );
}

/*
 * ============================================================================
 * 10. TREASURY SIGNER PREFLIGHT
 * ============================================================================
 */

section("10. TREASURY SIGNER PREFLIGHT");

let signerAddress = null;

if (
  ethers &&
  provider &&
  privateKey
) {
  try {
    const signer =
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
      "Private key produces valid signer"
    );

    if (treasuryWallet) {
      try {
        const expected =
          ethers.getAddress(
            treasuryWallet
          );

        const actual =
          ethers.getAddress(
            signerAddress
          );

        if (
          expected === actual
        ) {
          pass(
            "Signer matches TREASURY_WALLET"
          );
        } else {
          fail(
            "Signer matches TREASURY_WALLET",
            "Configured treasury address does not match signer."
          );
        }
      } catch (error) {
        warn(
          "Treasury signer comparison unavailable",
          error.message
        );
      }
    } else {
      warn(
        "TREASURY_WALLET not configured",
        "Signer address exists but explicit treasury address is absent."
      );
    }
  } catch (error) {
    fail(
      "Treasury signer can be constructed",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 11. TOKEN ABI PREFLIGHT
 * ============================================================================
 */

section("11. THB TOKEN ABI PREFLIGHT");

const abiPath =
  path.join(
    root,
    "backend/blockchain/thb_abi.json"
  );

if (fs.existsSync(abiPath)) {
  pass(
    "THB ABI exists",
    abiPath
  );

  try {
    const abi =
      JSON.parse(
        fs.readFileSync(
          abiPath,
          "utf8"
        )
      );

    const abiText =
      JSON.stringify(abi);

    if (
      abiText.includes("transfer")
    ) {
      pass(
        "ABI contains transfer function"
      );
    } else {
      fail(
        "ABI contains transfer function"
      );
    }

    if (
      abiText.includes("balanceOf")
    ) {
      pass(
        "ABI contains balanceOf function"
      );
    } else {
      warn(
        "ABI contains balanceOf function",
        "Balance preflight may require an expanded ABI."
      );
    }

    if (
      abiText.includes("decimals")
    ) {
      pass(
        "ABI contains decimals function"
      );
    } else {
      warn(
        "ABI contains decimals function",
        "Token decimals may need to be configured explicitly."
      );
    }
  } catch (error) {
    fail(
      "THB ABI is valid JSON",
      error.message
    );
  }
} else {
  fail(
    "THB ABI exists",
    abiPath
  );
}

/*
 * ============================================================================
 * 12. TOKEN READ-ONLY CONTRACT CHECKS
 * ============================================================================
 */

section("12. READ-ONLY TOKEN CONTRACT CHECKS");

let tokenContract = null;

if (
  ethers &&
  provider &&
  parsedContract &&
  fs.existsSync(abiPath)
) {
  try {
    const abi =
      JSON.parse(
        fs.readFileSync(
          abiPath,
          "utf8"
        )
      );

    tokenContract =
      new ethers.Contract(
        parsedContract,
        abi,
        provider
      );

    if (
      typeof tokenContract.name ===
      "function"
    ) {
      try {
        const name =
          await tokenContract.name();

        console.log(
          "Token name:",
          name
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
        const symbol =
          await tokenContract.symbol();

        console.log(
          "Token symbol:",
          symbol
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
        const decimals =
          await tokenContract.decimals();

        console.log(
          "Token decimals:",
          decimals.toString()
        );

        pass(
          "Token decimals readable"
        );
      } catch (error) {
        warn(
          "Token decimals readable",
          error.message
        );
      }
    }

    if (
      typeof tokenContract.balanceOf ===
      "function" &&
      signerAddress
    ) {
      try {
        const balance =
          await tokenContract.balanceOf(
            signerAddress
          );

        console.log(
          "Treasury token balance:",
          balance.toString()
        );

        pass(
          "Treasury token balance readable"
        );
      } catch (error) {
        warn(
          "Treasury token balance readable",
          error.message
        );
      }
    }
  } catch (error) {
    fail(
      "Read-only token contract initialization",
      error.message
    );
  }
}

/*
 * ============================================================================
 * 13. CANONICAL PATH STATIC VALIDATION
 * ============================================================================
 */

section("13. CANONICAL PATH STATIC VALIDATION");

const canonicalServiceSource =
  source(files.canonicalService);

const canonicalRouteSource =
  source(files.canonicalRoute);

const walletResolverSource =
  source(files.walletResolver);

const executorSource =
  source(files.realExecutor);

if (
  canonicalRouteSource.includes(
    ".createRewardForCompletedRide("
  )
) {
  pass(
    "Canonical API invokes canonical reward creation"
  );
} else {
  fail(
    "Canonical API invokes canonical reward creation"
  );
}

if (
  canonicalServiceSource.includes(
    "canonicalWalletResolver.resolveWallet"
  )
) {
  pass(
    "Canonical service resolves recipient through canonical wallet resolver"
  );
} else {
  fail(
    "Canonical service resolves recipient through canonical wallet resolver"
  );
}

if (
  canonicalServiceSource.includes(
    "findExistingReward"
  )
) {
  pass(
    "Canonical service contains duplicate reward protection"
  );
} else {
  warn(
    "Canonical service contains duplicate reward protection"
  );
}

if (
  executorSource.includes(
    "contract.transfer("
  )
) {
  pass(
    "Real executor contains on-chain token transfer operation"
  );
} else {
  fail(
    "Real executor contains on-chain token transfer operation"
  );
}

/*
 * ============================================================================
 * 14. FINAL PREFLIGHT DETERMINATION
 * ============================================================================
 */

section("14. FINAL STAGE 4G.8 DETERMINATION");

console.log(`
Failures: ${failures}
Warnings: ${warnings}

BLOCKCHAIN TRANSACTION SENT:
  NO

FILES MODIFIED:
  NO
`);

if (
  failures === 0
) {
  console.log(`
================================================================================
✓ STAGE 4G.8 — PREFLIGHT PASSED
================================================================================

The environment appears ready for the next architectural step.

IMPORTANT:
This does NOT automatically authorize a live transfer.

NEXT STEP:

Implement the canonical settlement bridge with:

  1. PENDING settlement state
  2. Exactly-once settlement lock
  3. Recipient validation
  4. Amount validation
  5. BSC Testnet chain assertion
  6. Treasury signer isolation
  7. On-chain transaction execution
  8. Transaction hash persistence
  9. Receipt confirmation
  10. Failure recovery
  11. Retry protection
  12. Settlement idempotency

================================================================================
`);
} else {
  console.log(`
================================================================================
⚠ STAGE 4G.8 — PREFLIGHT NOT PASSED
================================================================================

Resolve the FAIL conditions above before implementing or executing the
canonical blockchain settlement path.

Warnings may be acceptable depending on the final architecture.

NO BLOCKCHAIN TRANSACTION WAS SENT.

================================================================================
`);
}

console.log(`
================================================================================
STAGE 4G.8 COMPLETE — READ ONLY
================================================================================
`);


}

main().catch(error => {
  console.error("\n✗ STAGE 4G.8 AUDIT SCRIPT ERROR:");
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
