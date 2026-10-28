// "Do this exactly once" guard for anything that pays out or must never repeat.
// The first caller for a key wins; every simultaneous or later caller loses.
// Production uses the database's own primary key, so it holds across servers.
const memory = new Map();            // local development / tests only
const mode = () => process.env.CABLINK_ACCOUNT_PERSISTENCE || "LOCAL";
const supabase = () => require("../supabase/supabase_adapter");
const firestore = () => require("../firebase/firestore_adapter");
const COLLECTION = "cablink_locks";

async function acquire(key, payload = {}) {
    const doc = Object.assign({ key, at: new Date().toISOString() }, payload);
    if (mode() === "SUPABASE") return supabase().insertOnce(COLLECTION, key, doc);
    if (mode() === "FIRESTORE") return firestore().insertOnce(COLLECTION, key, doc);
    if (memory.has(key)) return false;
    memory.set(key, doc);
    return true;
}

// Only the winner calls this, so a plain write cannot race.
async function record(key, patch) {
    if (mode() === "SUPABASE") { const cur = (await supabase().read(COLLECTION, key)) || { key }; return supabase().write(COLLECTION, key, Object.assign({}, cur, patch)); }
    if (mode() === "FIRESTORE") return firestore().write(COLLECTION, key, patch);
    memory.set(key, Object.assign({}, memory.get(key), patch));
}

async function peek(key) {
    if (mode() === "SUPABASE") return supabase().read(COLLECTION, key);
    if (mode() === "FIRESTORE") return firestore().read(COLLECTION, key);
    return memory.get(key) || null;
}

module.exports = { acquire, record, peek };
