// Error reports sent by real phones, so problems in the field are visible to
// the admin instead of failing silently. Durable storage, never throws.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MODE = process.env.CABLINK_ACCOUNT_PERSISTENCE || "LOCAL";
const COLLECTION = "cablink_client_errors";
const LOCAL_FILE = path.join(__dirname, "..", "data", "client_errors.json");

const supabase = () => require("../supabase/supabase_adapter");
const firestore = () => require("../firebase/firestore_adapter");
const clip = (v, n) => String(v == null ? "" : v).slice(0, n);

function localLoad() { try { return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")).errors || []; } catch (e) { return []; } }

async function record(input, account) {
    const item = {
        id: "ERR-" + Date.now() + "-" + crypto.randomBytes(2).toString("hex"),
        message: clip(input.message, 300), where: clip(input.where, 200), page: clip(input.page, 120),
        agent: clip(input.agent, 160), account: account ? clip(account.name, 40) + " (" + account.role + ")" : "logged out",
        createdAt: new Date().toISOString()
    };
    if (!item.message) return null;
    if (MODE === "SUPABASE") await supabase().write(COLLECTION, item.id, item);
    else if (MODE === "FIRESTORE") await firestore().write(COLLECTION, item.id, item);
    else {
        const list = localLoad(); list.push(item);
        fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
        fs.writeFileSync(LOCAL_FILE, JSON.stringify({ errors: list.slice(-200) }, null, 2));
    }
    return item;
}

async function latest(limit = 50) {
    const all = MODE === "SUPABASE" ? await supabase().list(COLLECTION) : MODE === "FIRESTORE" ? await firestore().list(COLLECTION) : localLoad();
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

module.exports = { record, latest };
