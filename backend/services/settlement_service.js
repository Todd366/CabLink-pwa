// Records of fees drivers have paid to CabLink (cash and mobile-money rides are
// paid to the driver, so the platform fee is settled afterwards).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MODE = process.env.CABLINK_ACCOUNT_PERSISTENCE || "LOCAL";
const COLLECTION = "cablink_settlements";
const LOCAL_FILE = path.join(__dirname, "..", "data", "settlements.json");
const supabase = () => require("../supabase/supabase_adapter");
const firestore = () => require("../firebase/firestore_adapter");
const localLoad = () => { try { return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")).settlements || []; } catch (e) { return []; } };

async function all() {
    return MODE === "SUPABASE" ? supabase().list(COLLECTION) : MODE === "FIRESTORE" ? firestore().list(COLLECTION) : localLoad();
}
async function record({ driverId, driverName, amount, note }, adminId) {
    const value = Math.round(Number(amount) * 100) / 100;
    if (!driverId) throw new Error("Choose a driver");
    if (!(value > 0) || value > 100000) throw new Error("Enter an amount between P0.01 and P100,000");
    const item = {
        id: "SET-" + Date.now() + "-" + crypto.randomBytes(2).toString("hex"),
        driverId, driverName: String(driverName || "").slice(0, 60), amount: value,
        note: String(note || "").slice(0, 120), recordedBy: adminId || null, createdAt: new Date().toISOString()
    };
    if (MODE === "SUPABASE") await supabase().write(COLLECTION, item.id, item);
    else if (MODE === "FIRESTORE") await firestore().write(COLLECTION, item.id, item);
    else { const list = localLoad(); list.push(item); fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true }); fs.writeFileSync(LOCAL_FILE, JSON.stringify({ settlements: list }, null, 2)); }
    return item;
}
module.exports = { all, record };
