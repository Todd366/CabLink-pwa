// ============================================================
// VEHICLE SERVICE
//
// Real Vehicle records, tied to a driver's account instead of
// a free-text string on their application. Matches the same
// LOCAL/SUPABASE dual-mode persistence pattern as every other
// service built this session (incident_service.js,
// driver_application_service.js, etc.) — see
// backend/supabase/supabase_adapter.js's generic
// write/read/list against the `cablink_store` table.
//
// A Vehicle is auto-created when an application is approved
// (see driver_application_service.js::setStatus), seeded from
// whatever free-text the applicant typed into the "Vehicle"
// field on the application. That text can't reliably tell you
// service class or seating capacity, so a fresh Vehicle starts
// PENDING_VERIFICATION with a best-guess serviceClass/capacity —
// an admin corrects it from the Admin > Vehicles tab.
// ============================================================

const fs = require("fs");
const path = require("path");

const MODE = process.env.CABLINK_VEHICLE_PERSISTENCE || "LOCAL";
const COLLECTION = process.env.CABLINK_VEHICLE_FIRESTORE_COLLECTION || "cablink_vehicles";
const LOCAL_FILE = path.join(__dirname, "..", "data", "vehicles.json");

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
        return Array.isArray(parsed.vehicles) ? parsed.vehicles : [];
    } catch (error) {
        return [];
    }
}

function localSave(vehicles) {
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify({ vehicles }, null, 2), "utf8");
}

// Matches the ride-type cards actually offered to passengers in
// index.html's #rideTypeGrid (data-type values) — not an
// independent list that could drift out of sync with what a
// passenger can actually pick.
const SERVICE_CLASSES = ["standard", "premium", "xl", "moto", "quiet"];

const VERIFICATION_STATUSES = ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"];

// ------------------------------------------------------------
// UNIFIED LOAD/SAVE — branches on MODE
// ------------------------------------------------------------

async function loadVehicles() {
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(COLLECTION);
    }
    return localLoad();
}

async function saveVehicle(vehicle) {
    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(COLLECTION, vehicle.id, vehicle);
        return vehicle;
    }

    const vehicles = localLoad();
    const idx = vehicles.findIndex(v => v.id === vehicle.id);
    if (idx >= 0) vehicles[idx] = vehicle;
    else vehicles.push(vehicle);
    localSave(vehicles);
    return vehicle;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

// Best-effort guess at seating capacity from a serviceClass, used
// only as the starting point before an admin verifies the real
// number. Motorcycles carry the rider only; everything else
// defaults to a standard 4-seat sedan until corrected.
function defaultCapacityFor(serviceClass) {
    if (serviceClass === "moto") return 1;
    if (serviceClass === "xl") return 6;
    return 4;
}

function normalizeServiceClass(value) {
    const v = String(value || "").toLowerCase().trim();
    return SERVICE_CLASSES.includes(v) ? v : "standard";
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------

// Called from driver_application_service.js on approval. `vehicleText`
// is whatever the applicant typed (e.g. "Toyota Corolla") — free text,
// not a serviceClass. Idempotent: an account can only ever have one
// vehicle record, so re-approving (or any other caller) never creates
// duplicates.
async function createFromApplication({ accountId, vehicleText, applicationId }) {
    if (!accountId) {
        throw new Error("accountId is required to create a vehicle record");
    }

    const existing = await getVehicleByAccountId(accountId);
    if (existing) {
        return existing;
    }

    const serviceClass = "standard";

    const vehicle = {
        id: "VEH-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
        accountId,
        applicationId: applicationId || null,
        makeModel: vehicleText || "Not specified",
        plate: null,
        serviceClass,
        capacity: defaultCapacityFor(serviceClass),
        verificationStatus: "PENDING_VERIFICATION",
        verifiedBy: null,
        verifiedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await saveVehicle(vehicle);
    return vehicle;
}

async function getVehicleByAccountId(accountId) {
    if (!accountId) return null;
    const vehicles = await loadVehicles();
    return vehicles.find(v => v.accountId === accountId) || null;
}

async function getVehicleById(id) {
    const vehicles = await loadVehicles();
    return vehicles.find(v => v.id === id) || null;
}

async function listVehicles(status) {
    const vehicles = await loadVehicles();
    return status
        ? vehicles.filter(v => v.verificationStatus === status)
        : vehicles;
}

// Admin-only correction: service class, capacity, plate, make/model,
// and/or verification status. Only defined fields in `changes` are
// applied — callers send just what they're changing.
async function updateVehicle(id, changes, adminAccountId) {
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
        throw new Error("Vehicle not found");
    }

    if (changes.serviceClass !== undefined) {
        vehicle.serviceClass = normalizeServiceClass(changes.serviceClass);
    }
    if (changes.capacity !== undefined) {
        const capacity = Number(changes.capacity);
        vehicle.capacity = Number.isFinite(capacity) && capacity > 0 ? capacity : vehicle.capacity;
    }
    if (changes.makeModel !== undefined) {
        vehicle.makeModel = String(changes.makeModel).trim() || vehicle.makeModel;
    }
    if (changes.plate !== undefined) {
        vehicle.plate = String(changes.plate).trim() || null;
    }
    if (changes.verificationStatus !== undefined && VERIFICATION_STATUSES.includes(changes.verificationStatus)) {
        vehicle.verificationStatus = changes.verificationStatus;
        if (changes.verificationStatus === "VERIFIED") {
            vehicle.verifiedBy = adminAccountId || null;
            vehicle.verifiedAt = new Date().toISOString();
        }
    }

    vehicle.updatedAt = new Date().toISOString();

    await saveVehicle(vehicle);
    return vehicle;
}

// A compact snapshot safe to embed directly on a ride record once a
// driver accepts, so the passenger sees the real vehicle they're
// getting into rather than just the ride type they originally picked.
// Deliberately excludes internal fields (id, accountId, applicationId).
function toRideSnapshot(vehicle) {
    if (!vehicle) return null;
    return {
        makeModel: vehicle.makeModel,
        plate: vehicle.plate,
        serviceClass: vehicle.serviceClass,
        capacity: vehicle.capacity,
        verified: vehicle.verificationStatus === "VERIFIED"
    };
}

module.exports = {
    SERVICE_CLASSES,
    VERIFICATION_STATUSES,
    createFromApplication,
    getVehicleByAccountId,
    getVehicleById,
    listVehicles,
    updateVehicle,
    toRideSnapshot
};
