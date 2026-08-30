// ============================================================
// CABLINK — TREASURY WALLET ROTATION
// ============================================================
//
// Run this in Termux, NOT pasted back to Claude:
//
//   node scripts/rotate_treasury_wallet.js
//
// It generates a brand-new wallet locally and prints the address
// and private key to your own terminal only. Do this because the
// current PRIVATE_KEY in .env is compromised (per SESSION_CHANGELOG.md
// — it left the device during a prior audit).
//
// AFTER RUNNING:
//   1. Copy the new PRIVATE_KEY into .env (never send it to Claude
//      or paste it into any chat).
//   2. Update the same value in Vercel:
//        vercel env add PRIVATE_KEY
//      (paste when prompted, select Production + Preview)
//   3. Update TREASURY_WALLET to the new address, same way.
//   4. Fund the NEW address with testnet BNB from the faucet
//      referenced in your app (BSC testnet faucet).
//   5. If the OLD wallet holds any testnet BNB or THB, sweep it to
//      the new address, then treat the old key as permanently dead
//      — do not reuse it even on testnet.
//
// ============================================================

const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("\n=== NEW CABLINK TREASURY WALLET ===\n");
console.log("Address:     ", wallet.address);
console.log("Private Key: ", wallet.privateKey);
console.log("\nStore the private key in .env as PRIVATE_KEY and in");
console.log("Vercel env vars. Do not paste it anywhere else.\n");
