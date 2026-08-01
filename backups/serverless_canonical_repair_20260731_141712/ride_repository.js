const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "rides.json");

// In-process write lock for single-process runtime
let writeLock = Promise.resolve();

function withWriteLock(operation) {
    const run = writeLock.then(operation);
    writeLock = run.catch(() => {});
    return run;
}

function ensureStore() {
    try { require("fs").mkdirSync(DATA_DIR, { recursive: true }); } catch(_e) {}
    if (!fs.existsSync(FILE)) {
        try { fs.writeFileSync(FILE, "[]", "utf8"); } catch(_e) {}
    }
}

function load() {
    ensureStore();
    try {
        const raw = fs.readFileSync(FILE, "utf8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Ride database read error:", error);
        return [];
    }
}

function save(rides) {
    ensureStore();
    try {
        fs.writeFileSync(FILE, JSON.stringify(rides, null, 2), "utf8");
    } catch(_e) {
        /* Vercel read-only FS — in-memory only */
    }
}

function create(ride) {
    const rides = load();
    rides.push(ride);
    save(rides);
    return ride;
}

function findById(id) {
    return load().find(ride => ride.id === String(id)) || null;
}

function all() {
    return load();
}

function update(id, changes) {
    const rides = load();
    const index = rides.findIndex(ride => ride.id === String(id));
    if (index === -1) return null;
    rides[index] = {
        ...rides[index],
        ...changes,
        updatedAt: new Date().toISOString()
    };
    save(rides);
    return rides[index];
}

async function accept(id, driverId, driverName) {
    return withWriteLock(async () => {
        const rides = load();
        const index = rides.findIndex(ride => ride.id === String(id));

        if (index === -1) {
            return { success: false, code: "NOT_FOUND", error: "Ride not found" };
        }

        const ride = rides[index];

        if (ride.status !== "MATCHING") {
            return {
                success: false,
                code: "ALREADY_ACCEPTED",
                error: "Ride is no longer available for acceptance",
                currentStatus: ride.status,
                ride
            };
        }

        if (!driverId) {
            return { success: false, code: "DRIVER_ID_REQUIRED", error: "Driver ID is required" };
        }

        rides[index] = {
            ...ride,
            driverId: String(driverId),
            driverName: driverName || ride.driverName || null,
            status: "DRIVER_ASSIGNED",
            acceptedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        save(rides);

        return { success: true, code: "ACCEPTED", ride: rides[index] };
    });
}

module.exports = { create, findById, all, update, accept };
