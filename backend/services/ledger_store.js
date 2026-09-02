const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_LEDGER_PERSISTENCE || "LOCAL";
const LEDGER_FILE = path.join(__dirname, "..", "data", "economy_ledger.json");
const COLLECTION = "economy_ledger";
const DOC_ID = "main";

let supabase = null;
function getSupabaseAdapter() {
    if (!supabase) {
        supabase = require("../supabase/supabase_adapter");
    }
    return supabase;
}

function defaultLedger() {
    return { rides: [], transactions: [] };
}

function localLoad() {
    if (!fs.existsSync(LEDGER_FILE)) {
        return defaultLedger();
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, "utf8"));
        return {
            rides: Array.isArray(parsed.rides) ? parsed.rides : [],
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
        };
    } catch (error) {
        return defaultLedger();
    }
}

function localSave(data) {
    fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ------------------------------------------------------------
// This is the single ledger both economy_ledger_service.js and
// canonical_reward_service.js now read/write through. Previously
// each had its own private load()/save() pointed at the same
// on-disk file — functionally compatible (same {rides,
// transactions} shape) but two independent flat-file readers,
// which on Vercel doesn't persist between invocations at all.
// Same fix as rides/accounts/applications/drivers earlier this
// session, applied here once, shared by both callers.
// ------------------------------------------------------------

async function loadLedger() {
    if (MODE === "SUPABASE") {
        const result = await getSupabaseAdapter().read(COLLECTION, DOC_ID);
        return result.exists ? result.data : defaultLedger();
    }
    return localLoad();
}

async function saveLedger(data) {
    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(COLLECTION, DOC_ID, data);
        return;
    }
    localSave(data);
}

module.exports = { loadLedger, saveLedger };
