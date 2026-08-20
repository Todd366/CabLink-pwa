// ============================================================
// DRIVER WALLET SERVICE — DUAL-MODE PERSISTENCE
//
// PATCH 13: replaces driver_wallet_api.js's direct flat-JSON
// reads/writes to backend/data/drivers.json — same class of
// bug already fixed for accounts and driver online status.
//
// IMPORTANT — known remaining gap, not fixed by this patch:
// backend/rewards/canonical_wallet_resolver.js still reads
// drivers.json (and users.json, drivers_live.json) directly
// with synchronous fs calls, completely separate from this
// service. That means even after this patch, a wallet linked
// here in FIRESTORE mode will NOT be found by the reward
// pipeline in production — canonical_wallet_resolver.js needs
// its own dedicated fix to read from the same source. Flagging
// this clearly rather than leaving it silently broken.
//
// Set CABLINK_WALLET_PERSISTENCE=FIRESTORE in Vercel's
// environment variables (same Firebase Admin credentials
// already configured) once ready. Defaults to LOCAL flat-file
// storage for local Termux dev.
// ============================================================

const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_WALLET_PERSISTENCE || "LOCAL";

const WALLETS_FILE = path.join(__dirname, "..", "data", "driver_wallets.json");
const WALLETS_COLLECTION = process.env.CABLINK_WALLET_FIRESTORE_COLLECTION || "cablink_driver_wallets";

let firestore = null;
function getFirestoreAdapter() {
    if (!firestore) {
        firestore = require("../firebase/firestore_adapter");
    }
    return firestore;
}

// ------------------------------------------------------------
// LOCAL (flat-file) storage
// ------------------------------------------------------------

function localLoadWallets() {
    if (!fs.existsSync(WALLETS_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
        return Array.isArray(parsed.wallets) ? parsed.wallets : [];
    } catch (error) {
        return [];
    }
}

function localSaveWallets(wallets) {
    fs.mkdirSync(path.dirname(WALLETS_FILE), { recursive: true });
    fs.writeFileSync(WALLETS_FILE, JSON.stringify({ wallets }, null, 2), "utf8");
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------

async function getWallet(driverId) {
    driverId = String(driverId);

    if (MODE === "FIRESTORE") {
        const result = await getFirestoreAdapter().read(WALLETS_COLLECTION, driverId);
        return result.exists ? result.data.wallet : null;
    }

    const wallets = localLoadWallets();
    const record = wallets.find(w => w.id === driverId);
    return record ? record.wallet : null;
}

async function setWallet(driverId, wallet) {
    driverId = String(driverId);

    const record = {
        id: driverId,
        wallet,
        walletLinkedAt: new Date().toISOString()
    };

    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(WALLETS_COLLECTION, driverId, record);
        return record;
    }

    const wallets = localLoadWallets().filter(w => w.id !== driverId);
    wallets.push(record);
    localSaveWallets(wallets);
    return record;
}

module.exports = {
    getWallet,
    setWallet
};
