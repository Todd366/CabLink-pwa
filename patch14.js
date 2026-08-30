// ============================================================
// PATCH 14 — WALLET RESOLVER NOW SEES REAL LINKED WALLETS
// ============================================================
//
// canonical_wallet_resolver.js used to read ONLY the old flat
// drivers.json/users.json/drivers_live.json files directly —
// completely disconnected from driver_wallet_service.js (added
// in patch 13), which is what driver_wallet_api.js actually
// writes linked wallets to now. Result: even after patch 13, a
// driver linking their wallet through the real app would never
// see a reward, because the resolver never looked in the right
// place.
//
// Fixed: findLinkedWallet() (and therefore resolveWallet()) is
// now async and checks driver_wallet_service.js FIRST, falling
// back to the old flat files only for wallets linked before this
// patch, so nothing already-linked silently breaks.
//
// Only one call site needed updating: canonical_reward_service.js
// already has createRewardForCompletedRide() as async, and every
// caller of it already awaits it (ride_completion_service.js,
// canonical_reward_api.js) — so this patch just adds the missing
// await keyword at the one place resolveWallet() is actually
// called. No other files need to change.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

function writeFile(relPath, content, label) {
    const full = p(relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    console.log("wrote " + relPath + " (" + label + ")");
}

function patchExactText(relPath, oldStr, newStr, label) {
    const full = p(relPath);
    const content = fs.readFileSync(full, "utf8");
    const occurrences = content.split(oldStr).length - 1;

    if (occurrences !== 1) {
        console.log("ABORT: expected exactly 1 match for the resolveWallet call in " + relPath + ", found " + occurrences + ". Not touching this file — check it manually.");
        process.exitCode = 1;
        return;
    }

    fs.writeFileSync(full, content.replace(oldStr, newStr), "utf8");
    console.log("patched " + relPath + " (" + label + ")");
}


writeFile(
    "backend/rewards/canonical_wallet_resolver.js",
    "'use strict';\n\nconst fs = require('fs');\nconst path = require('path');\nconst { ethers } = require('ethers');\nconst driverWalletService = require('../services/driver_wallet_service');\n\nconst USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');\nconst DRIVERS_FILE = path.join(__dirname, '..', 'data', 'drivers.json');\nconst DRIVERS_LIVE_FILE = path.join(__dirname, '..', 'data', 'drivers_live.json');\n\nconst PLACEHOLDER_WALLETS = new Set([\n  'TEST-WALLET',\n  'API-TEST-WALLET',\n  'PILOT-TEST-WALLET',\n  'TEST_WALLET',\n  'API_TEST_WALLET',\n  'PILOT_TEST_WALLET',\n  'PLACEHOLDER',\n  'PLACEHOLDER-WALLET',\n  'YOUR-WALLET',\n  'YOUR_WALLET',\n  'NULL',\n  'UNDEFINED'\n]);\n\nfunction normaliseIdentity(value) {\n  if (value === null || value === undefined) {\n    return null;\n  }\n\n  const result = String(value).trim();\n\n  return result.length ? result : null;\n}\n\nfunction isPlaceholderWallet(value) {\n  if (typeof value !== 'string') {\n    return true;\n  }\n\n  const normalised = value.trim().toUpperCase();\n\n  if (!normalised) {\n    return true;\n  }\n\n  if (PLACEHOLDER_WALLETS.has(normalised)) {\n    return true;\n  }\n\n  if (\n    normalised.includes('TEST-WALLET') ||\n    normalised.includes('TEST_WALLET') ||\n    normalised.includes('PILOT-TEST') ||\n    normalised.includes('PLACEHOLDER')\n  ) {\n    return true;\n  }\n\n  return false;\n}\n\nfunction validateWallet(value) {\n  if (isPlaceholderWallet(value)) {\n    return null;\n  }\n\n  const wallet = String(value).trim();\n\n  if (!ethers.isAddress(wallet)) {\n    return null;\n  }\n\n  return ethers.getAddress(wallet);\n}\n\nfunction readJson(file) {\n  try {\n    if (!fs.existsSync(file)) {\n      return [];\n    }\n\n    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));\n\n    return Array.isArray(parsed) ? parsed : [];\n  } catch (error) {\n    return [];\n  }\n}\n\nfunction findWalletInRecord(record) {\n  if (!record || typeof record !== 'object') {\n    return null;\n  }\n\n  const candidates = [\n    record.wallet,\n    record.walletAddress,\n    record.wallet_address,\n    record.address\n  ];\n\n  for (const candidate of candidates) {\n    const validWallet = validateWallet(candidate);\n\n    if (validWallet) {\n      return validWallet;\n    }\n  }\n\n  return null;\n}\n\n// PATCH 14: legacy fallback only. This used to be the ONLY place\n// findLinkedWallet looked — flat JSON files that driver_wallet_api.js\n// no longer writes to since patch 13. Kept as a read-only fallback so\n// a wallet linked before that patch still resolves, but it is no\n// longer the primary source.\nfunction findLinkedWalletInLegacyFiles(id) {\n  const sources = [\n    readJson(USERS_FILE),\n    readJson(DRIVERS_FILE),\n    readJson(DRIVERS_LIVE_FILE)\n  ];\n\n  for (const records of sources) {\n    for (const record of records) {\n      if (!record || typeof record !== 'object') {\n        continue;\n      }\n\n      if (\n        String(record.id || '').trim() === id ||\n        String(record.userId || '').trim() === id ||\n        String(record.driverId || '').trim() === id\n      ) {\n        const wallet = findWalletInRecord(record);\n\n        if (wallet) {\n          return wallet;\n        }\n      }\n    }\n  }\n\n  return null;\n}\n\n// PATCH 14: now async, and now checks the real, current wallet\n// store (backend/services/driver_wallet_service.js — the same\n// LOCAL/FIRESTORE dual-mode persistence driver_wallet_api.js\n// writes to since patch 13) FIRST, before falling back to the old\n// flat files for anything linked before that fix. This is the\n// change that actually makes linked wallets visible to the reward\n// pipeline again in production.\nasync function findLinkedWallet(identity) {\n  const id = normaliseIdentity(identity);\n\n  if (!id) {\n    return null;\n  }\n\n  const current = await driverWalletService.getWallet(id);\n  const validCurrent = validateWallet(current);\n\n  if (validCurrent) {\n    return validCurrent;\n  }\n\n  return findLinkedWalletInLegacyFiles(id);\n}\n\n/**\n * Canonical wallet resolution.\n *\n * Identity -> linked wallet -> validation -> canonical address\n *\n * Returns null when:\n * - identity is missing\n * - no linked wallet exists\n * - wallet is a placeholder\n * - wallet is not a valid EVM address\n *\n * The treasury wallet is deliberately NOT used as a fallback.\n *\n * PATCH 14: now async — see findLinkedWallet above. Every caller\n * of resolveWallet must now `await` it.\n */\nasync function resolveWallet(identity, suppliedWallet) {\n  const linkedWallet = await findLinkedWallet(identity);\n\n  if (linkedWallet) {\n    return linkedWallet;\n  }\n\n  return validateWallet(suppliedWallet);\n}\n\nmodule.exports = {\n  resolveWallet,\n  validateWallet,\n  isPlaceholderWallet,\n  findLinkedWallet\n};\n",
    "now async, checks driver_wallet_service.js first"
);

patchExactText(
    "backend/services/canonical_reward_service.js",
    "        wallet: canonicalWalletResolver.resolveWallet(\n      ride.driverId || ride.userId,\n      ride.wallet\n    )",
    "        wallet: await canonicalWalletResolver.resolveWallet(\n      ride.driverId || ride.userId,\n      ride.wallet\n    )",
    "added missing await on resolveWallet()"
);

if (process.exitCode === 1) {
    console.log("");
    console.log("Patch 14 stopped early — canonical_reward_service.js was NOT modified.");
    process.exit(1);
}

const { execSync } = require("child_process");

function syntaxCheck(relPath) {
    try {
        execSync("node -c " + JSON.stringify(p(relPath)), { stdio: "pipe" });
        console.log("syntax OK: " + relPath);
        return true;
    } catch (error) {
        console.log("SYNTAX ERROR in " + relPath);
        console.log(error.stderr ? error.stderr.toString() : error.message);
        return false;
    }
}

const files = [
    "backend/rewards/canonical_wallet_resolver.js",
    "backend/services/canonical_reward_service.js"
];

const ok = files.every(syntaxCheck);

console.log("");
if (ok) {
    console.log("Patch 14 complete — linked wallets are now visible to the reward pipeline.");
} else {
    console.log("Patch 14 wrote/patched files but a syntax check failed — review before deploying.");
}
