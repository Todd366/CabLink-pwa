const fs = require("fs");
const path = require("path");

console.log(`
================================================================================
CABLINK STAGE 4G.6 — REWARD EXECUTION PATH INSPECTOR
================================================================================
`);

const root = process.cwd();

const targets = [
  "backend/services/canonical_reward_service.js",
  "backend/rewards/canonical_wallet_resolver.js",
  "backend",
  "frontend"
];

const extensions = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".json"
]);

const keywords = [
  "ethers",
  "Contract",
  "JsonRpcProvider",
  "Wallet",
  "transfer(",
  "sendTransaction",
  "wait(",
  "transactionHash",
  "txHash",
  "receipt",
  "reward",
  "THB",
  "BSC",
  "chainId",
  "contractAddress",
  "tokenAddress",
  "privateKey",
  "RPC_URL",
  "RPC",
  "TREASURY"
];

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  let entries;

  try {
    entries = fs.readdirSync(dir, {
      withFileTypes: true
    });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else if (extensions.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

let files = [];

for (const target of targets) {
  const fullPath = path.join(root, target);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
}

files = [...new Set(files)];

console.log("Files inspected:", files.length);

const matches = [];

for (const file of files) {
  let source;

  try {
    source = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    const matchedKeywords = keywords.filter(keyword =>
      line.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length) {
      matches.push({
        file: path.relative(root, file),
        line: index + 1,
        keywords: matchedKeywords,
        text: line.trim()
      });
    }
  });
}

console.log(`
================================================================================
BLOCKCHAIN / REWARD REFERENCES
================================================================================
`);

if (!matches.length) {
  console.log("No matching blockchain or reward references found.");
} else {
  for (const match of matches) {
    console.log(
      `\n[${match.file}:${match.line}]`
    );
    console.log(
      "Keywords:",
      match.keywords.join(", ")
    );
    console.log(
      match.text
    );
  }
}

console.log(`
================================================================================
FUNCTION EXPORT INSPECTION
================================================================================
`);

const rewardServicePath = path.join(
  root,
  "backend/services/canonical_reward_service.js"
);

try {
  const rewardService = require(rewardServicePath);

  console.log(
    "canonical_reward_service exports:",
    Object.keys(rewardService)
  );

  for (const [key, value] of Object.entries(rewardService)) {
    console.log(
      `  ${key}: ${typeof value}`
    );
  }
} catch (error) {
  console.log(
    "Could not inspect reward service exports:",
    error.message
  );
}

console.log(`
================================================================================
STAGE 4G.6 — INSPECTION COMPLETE
================================================================================

This inspection was READ-ONLY.

✓ No files modified
✓ No wallet transactions sent
✓ No blockchain calls made

Use the output above to identify the authoritative reward execution function
and the actual blockchain executor before proceeding to a live BSC Testnet
transfer.
================================================================================
`);
