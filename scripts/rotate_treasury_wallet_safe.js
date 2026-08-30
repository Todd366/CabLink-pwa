// ============================================================
// CABLINK — TREASURY WALLET ROTATION (SAFE VERSION)
// ============================================================
//
// Run this in Termux:
//
//   node scripts/rotate_treasury_wallet_safe.js
//
// Unlike the previous version, this does NOT print the private
// key to the screen. It writes PRIVATE_KEY and TREASURY_WALLET
// directly into your .env file. This means there is nothing to
// copy-paste and nothing that can end up somewhere it shouldn't.
//
// AFTER RUNNING:
//   Just confirm it printed "Done" at the bottom. That's it for
//   your local .env — it's already updated.
//
//   You still need to put the same two values into Vercel, but
//   you never have to look at them to do that — see the next
//   step for a way to do it without typing the key by hand.
//
// ============================================================

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const ENV_PATH = path.join(__dirname, "..", ".env");

const wallet = ethers.Wallet.createRandom();

let content = "";
try {
    content = fs.readFileSync(ENV_PATH, "utf8");
} catch (_) {
    content = "";
}

function setVar(text, key, value) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(text)) {
        return text.replace(pattern, line);
    }
    return text.trim() + "\n" + line + "\n";
}

content = setVar(content, "PRIVATE_KEY", wallet.privateKey);
content = setVar(content, "TREASURY_WALLET", wallet.address);

fs.writeFileSync(ENV_PATH, content, "utf8");

console.log("\nDone. .env updated with a new PRIVATE_KEY and TREASURY_WALLET.");
console.log("New wallet address ends in: ..." + wallet.address.slice(-6));
console.log("(The full key was never printed — it only lives in .env now.)\n");
