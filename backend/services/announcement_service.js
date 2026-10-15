// Announcements from the CabLink team (pilot news, fare changes, safety
// notices). Stored with the same durable adapters as accounts and rides.
const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_ANNOUNCEMENT_PERSISTENCE || process.env.CABLINK_ACCOUNT_PERSISTENCE || "LOCAL";
const COLLECTION = "cablink_announcements";
const LOCAL_FILE = path.join(__dirname, "..", "data", "announcements.json");
const AUDIENCES = ["ALL", "RIDERS", "DRIVERS"];

const supabase = () => require("../supabase/supabase_adapter");
const firestore = () => require("../firebase/firestore_adapter");

function localLoad() {
    try { return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")).announcements || []; } catch (e) { return []; }
}
async function loadAll() {
    if (MODE === "SUPABASE") return supabase().list(COLLECTION);
    if (MODE === "FIRESTORE") return firestore().list(COLLECTION);
    return localLoad();
}
async function save(item) {
    if (MODE === "SUPABASE") { await supabase().write(COLLECTION, item.id, item); return item; }
    if (MODE === "FIRESTORE") { await firestore().write(COLLECTION, item.id, item); return item; }
    const list = localLoad();
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list[i] = item; else list.push(item);
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify({ announcements: list }, null, 2));
    return item;
}

// Pure: which announcements a person with this role should see.
function visibleTo(role, list, now = Date.now()) {
    const driver = role === "APPROVED_DRIVER";
    return list
        .filter(a => a.active !== false && (!a.expiresAt || new Date(a.expiresAt).getTime() > now))
        .filter(a => a.audience === "ALL" || (a.audience === "DRIVERS" ? driver : !driver && role !== "ADMIN"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(({ id, title, message, createdAt }) => ({ id, title, message, createdAt }));
}

async function create({ title, message, audience, days }, adminId) {
    const t = String(title || "").trim(), m = String(message || "").trim();
    if (!t || t.length > 80) throw new Error("Title is required (80 characters max)");
    if (!m || m.length > 400) throw new Error("Message is required (400 characters max)");
    const now = new Date();
    const d = Number(days);
    return save({
        id: "ANN-" + now.getTime() + "-" + require("crypto").randomBytes(2).toString("hex"),
        title: t, message: m, active: true,
        audience: AUDIENCES.includes(audience) ? audience : "ALL",
        createdAt: now.toISOString(), createdBy: adminId || null,
        expiresAt: d > 0 ? new Date(now.getTime() + Math.min(d, 90) * 864e5).toISOString() : null
    });
}
async function retire(id) {
    const item = (await loadAll()).find(a => a.id === id);
    if (!item) throw new Error("Announcement not found");
    item.active = false;
    return save(item);
}

module.exports = { loadAll, create, retire, visibleTo, AUDIENCES };
