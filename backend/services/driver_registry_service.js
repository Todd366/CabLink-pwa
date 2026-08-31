// ============================================================
// CABLINK PERSISTENT DRIVER REGISTRY
// ============================================================
//
// Replaces the old in-memory `onlineDrivers = []` array that
// used to live directly inside backend/routes/driver_online_api.js.
//
// That array was fine on a single long-running Termux/local
// process, but on Vercel's serverless model every cold start
// gets a fresh process — so the entire online-driver list (and
// therefore ride matching) could silently reset to empty at any
// moment in production. This mirrors the exact dual-mode
// LOCAL/FIRESTORE pattern already established in
// backend/canonical/ride_persistence.js so the whole backend
// stays on one consistent persistence approach.
//
// Mode is controlled by CABLINK_DRIVER_PERSISTENCE (defaults to
// LOCAL, same convention as CABLINK_RIDE_PERSISTENCE). Set it to
// FIRESTORE in Vercel's environment variables before relying on
// this in production, exactly like the ride store.
// ============================================================

const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_DRIVER_PERSISTENCE || "LOCAL";

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "drivers_online.json");

const COLLECTION =
    process.env.CABLINK_DRIVER_FIRESTORE_COLLECTION || "cablink_online_drivers";

let firestore = null;

function getFirestoreAdapter() {
    if (!firestore) {
        firestore = require("../firebase/firestore_adapter");
    }
    return firestore;
}

let supabase = null;

function getSupabaseAdapter() {
    if (!supabase) {
        supabase = require("../supabase/supabase_adapter");
    }
    return supabase;
}

// ------------------------------------------------------------
// LOCAL STORAGE
// ------------------------------------------------------------

function ensureLocalStore() {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (_) {}

    if (!fs.existsSync(FILE)) {
        try {
            fs.writeFileSync(FILE, "[]", "utf8");
        } catch (_) {}
    }
}

function loadLocal() {
    ensureLocalStore();
    try {
        const raw = fs.readFileSync(FILE, "utf8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Driver registry local read error:", error);
        return [];
    }
}

function saveLocal(drivers) {
    ensureLocalStore();
    try {
        fs.writeFileSync(FILE, JSON.stringify(drivers, null, 2), "utf8");
        return true;
    } catch (error) {
        console.error("Driver registry local write error:", error);
        return false;
    }
}

// ------------------------------------------------------------
// GO ONLINE (create or replace this driver's entry)
// ------------------------------------------------------------

async function goOnline(driver) {
    if (!driver.id) {
        // Defensive fallback only — the real app already sends the
        // logged-in account id (see CABLINK_DRIVER_REALITY_PATCH in
        // frontend/index.html). This branch just stops a malformed
        // request from crashing the endpoint.
        driver.id = "DRV-" + Date.now();
    }

    const record = {
        ...driver,
        id: String(driver.id),
        status: "ONLINE",
        updatedAt: new Date().toISOString()
    };

    if (MODE === "FIRESTORE") {
        const db = getFirestoreAdapter();
        await db.write(COLLECTION, record.id, record);
        return record;
    }

    if (MODE === "SUPABASE") {
        const db = getSupabaseAdapter();
        await db.write(COLLECTION, record.id, record);
        return record;
    }

    const drivers = loadLocal().filter(d => d.id !== record.id);
    drivers.push(record);
    saveLocal(drivers);
    return record;
}

// ------------------------------------------------------------
// GO OFFLINE (remove this driver's entry)
// ------------------------------------------------------------

async function goOffline(id) {
    const driverId = String(id);

    if (MODE === "FIRESTORE") {
        const db = getFirestoreAdapter();
        await db.delete(COLLECTION, driverId);
        return true;
    }

    if (MODE === "SUPABASE") {
        const db = getSupabaseAdapter();
        await db.delete(COLLECTION, driverId);
        return true;
    }

    const drivers = loadLocal().filter(d => d.id !== driverId);
    saveLocal(drivers);
    return true;
}

// ------------------------------------------------------------
// LIST ALL ONLINE DRIVERS
// ------------------------------------------------------------

async function all() {
    if (MODE === "FIRESTORE") {
        const db = getFirestoreAdapter();
        return db.list(COLLECTION);
    }

    if (MODE === "SUPABASE") {
        const db = getSupabaseAdapter();
        return db.list(COLLECTION);
    }

    return loadLocal();
}

// ------------------------------------------------------------
// STATUS (for health checks / debugging, matches ride_persistence.status())
// ------------------------------------------------------------

function status() {
    return {
        mode: MODE,
        provider:
            MODE === "FIRESTORE"
                ? "FIRESTORE"
                : MODE === "SUPABASE"
                    ? "SUPABASE"
                    : "LOCAL",
        file: FILE,
        collection: COLLECTION
    };
}

module.exports = {
    goOnline,
    goOffline,
    all,
    status
};
