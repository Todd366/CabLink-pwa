const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_INCIDENT_PERSISTENCE || "LOCAL";
const COLLECTION = process.env.CABLINK_INCIDENT_FIRESTORE_COLLECTION || "cablink_incidents";
const LOCAL_FILE = path.join(__dirname, "..", "data", "incidents.json");

let supabase = null;
function getSupabaseAdapter() {
    if (!supabase) {
        supabase = require("../supabase/supabase_adapter");
    }
    return supabase;
}

function localLoad() {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
        return Array.isArray(parsed.incidents) ? parsed.incidents : [];
    } catch (error) {
        return [];
    }
}

function localSave(incidents) {
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify({ incidents }, null, 2), "utf8");
}

const VALID_TYPES = [
    "SOS",
    "DRIVER_ISSUE",
    "PASSENGER_ISSUE",
    "SAFETY",
    "LOST_PROPERTY",
    "DELIVERY_FAILURE",
    "PAYMENT_DISPUTE",
    "VEHICLE_PROBLEM"
];

// Matches the INCIDENT MANAGEMENT shape from the architecture doc
// (Section 24): id, status, reporter, related trip, timestamp,
// description, action, outcome.
async function createIncident(data) {
    const incident = {
        id: "INC-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
        type: VALID_TYPES.includes(data.type) ? data.type : "SAFETY",
        status: "OPEN",
        reporterAccountId: data.reporterAccountId || null,
        reporterName: data.reporterName || null,
        rideId: data.rideId || null,
        description: data.description || "",
        location: data.location || null,
        action: null,
        outcome: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(COLLECTION, incident.id, incident);
        return incident;
    }

    const incidents = localLoad();
    incidents.push(incident);
    localSave(incidents);
    return incident;
}

async function listIncidents() {
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(COLLECTION);
    }
    return localLoad();
}

async function listIncidentsForAccount(accountId) {
    const all = await listIncidents();
    return all.filter(i => i.reporterAccountId === accountId);
}

async function updateIncident(id, changes) {
    if (MODE === "SUPABASE") {
        const db = getSupabaseAdapter();
        const result = await db.read(COLLECTION, id);
        if (!result.exists) return null;
        const updated = { ...result.data, ...changes, updatedAt: new Date().toISOString() };
        await db.write(COLLECTION, id, updated);
        return updated;
    }

    const incidents = localLoad();
    const incident = incidents.find(i => i.id === id);
    if (!incident) return null;
    Object.assign(incident, changes, { updatedAt: new Date().toISOString() });
    localSave(incidents);
    return incident;
}

module.exports = {
    createIncident,
    listIncidents,
    listIncidentsForAccount,
    updateIncident,
    VALID_TYPES
};
