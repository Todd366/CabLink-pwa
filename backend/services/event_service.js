const MODE = process.env.CABLINK_EVENT_PERSISTENCE || "LOCAL";
const COLLECTION = "cablink_events";

const fs = require("fs");
const path = require("path");
const LOCAL_FILE = path.join(__dirname, "..", "data", "events.json");

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
        return Array.isArray(parsed.events) ? parsed.events : [];
    } catch (error) {
        return [];
    }
}

function localSave(events) {
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify({ events }, null, 2), "utf8");
}

// Matches Section 31 of the architecture doc: these are the real
// operational events the rest of the system already produces —
// this module just gives them one place to be recorded, so
// analysis has something real to read from.
const EVENT_TYPES = [
    "RIDE_CREATED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "TRIP_STARTED",
    "TRIP_COMPLETED", "TRIP_CANCELLED", "DRIVER_ONLINE", "DRIVER_OFFLINE",
    "INCIDENT_CREATED", "DRIVER_APPLICATION_SUBMITTED", "DRIVER_APPROVED"
];

// Never let event logging break the real action it's attached to —
// this is observational, not load-bearing. A failure here should
// never surface to the person booking a ride or completing a trip.
async function recordEvent(type, data) {
    try {
        const event = {
            id: "EVT-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            type: EVENT_TYPES.includes(type) ? type : "UNKNOWN",
            rideId: data?.rideId || null,
            driverId: data?.driverId || null,
            passengerAccountId: data?.passengerAccountId || null,
            pickup: data?.pickup || null,
            dropoff: data?.dropoff || null,
            meta: data?.meta || null,
            createdAt: new Date().toISOString()
        };

        if (MODE === "SUPABASE") {
            await getSupabaseAdapter().write(COLLECTION, event.id, event);
        } else {
            const events = localLoad();
            events.push(event);
            localSave(events);
        }

        return event;
    } catch (error) {
        console.error("[CABLINK] Event logging failed (non-fatal):", error.message);
        return null;
    }
}

async function listEvents() {
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(COLLECTION);
    }
    return localLoad();
}

module.exports = { recordEvent, listEvents, EVENT_TYPES };
