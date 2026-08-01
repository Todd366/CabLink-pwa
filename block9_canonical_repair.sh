#!/usr/bin/env bash
set -e

echo "============================================================"
echo " CABLINK BLOCK 9 — CANONICAL RUNTIME REPAIR"
echo "============================================================"

python3 <<'PYEOF'
from pathlib import Path

# ============================================================
# 1. PATCH CANONICAL REPOSITORY
# ============================================================

repo = Path("backend/canonical/ride_repository.js")

repo.write_text(r'''const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "rides.json");

// ============================================================
// In-process write lock.
//
// The current CabLink canonical repository uses a JSON file.
// This lock prevents two concurrent acceptance operations
// inside the same Node.js process from both winning.
//
// NOTE:
// This is appropriate for the current single-process runtime.
// A future multi-instance production deployment should move
// ride persistence to a transactional database.
// ============================================================

let writeLock = Promise.resolve();

function withWriteLock(operation) {
    const run = writeLock.then(operation);

    writeLock = run.catch(() => {});

    return run;
}

function ensureStore() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "[]", "utf8");
    }
}

function load() {
    ensureStore();

    try {
        const raw = fs.readFileSync(FILE, "utf8");
        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error(
            "❌ Ride database read error:",
            error
        );

        return [];
    }
}

function save(rides) {
    ensureStore();

    fs.writeFileSync(
        FILE,
        JSON.stringify(rides, null, 2),
        "utf8"
    );
}

function create(ride) {
    const rides = load();

    rides.push(ride);

    save(rides);

    return ride;
}

function findById(id) {
    return load().find(
        ride => ride.id === String(id)
    ) || null;
}

function all() {
    return load();
}

function update(id, changes) {
    const rides = load();

    const index = rides.findIndex(
        ride => ride.id === String(id)
    );

    if (index === -1) {
        return null;
    }

    rides[index] = {
        ...rides[index],
        ...changes,
        updatedAt: new Date().toISOString()
    };

    save(rides);

    return rides[index];
}

// ============================================================
// ATOMIC ACCEPT
//
// Only a ride currently in MATCHING can be accepted.
//
// The state check and state update occur inside the same
// serialized write operation.
//
// First caller:
//   MATCHING -> DRIVER_ASSIGNED
//
// Second caller:
//   sees DRIVER_ASSIGNED -> rejected
// ============================================================

async function accept(id, driverId, driverName) {

    return withWriteLock(async () => {

        const rides = load();

        const index = rides.findIndex(
            ride => ride.id === String(id)
        );

        if (index === -1) {

            return {
                success: false,
                code: "NOT_FOUND",
                error: "Ride not found"
            };
        }

        const ride = rides[index];

        if (ride.status !== "MATCHING") {

            return {
                success: false,
                code: "ALREADY_ACCEPTED",
                error:
                    "Ride is no longer available for acceptance",
                currentStatus: ride.status,
                ride
            };
        }

        if (!driverId) {

            return {
                success: false,
                code: "DRIVER_ID_REQUIRED",
                error: "Driver ID is required"
            };
        }

        rides[index] = {
            ...ride,

            driverId: String(driverId),

            driverName:
                driverName ||
                ride.driverName ||
                null,

            status: "DRIVER_ASSIGNED",

            acceptedAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        save(rides);

        return {
            success: true,
            code: "ACCEPTED",
            ride: rides[index]
        };
    });
}

module.exports = {
    create,
    findById,
    all,
    update,
    accept
};
''', encoding="utf-8")

print("PATCHED: backend/canonical/ride_repository.js")


# ============================================================
# 2. PATCH CANONICAL RIDE ENGINE
# ============================================================

engine = Path("backend/canonical/ride_engine.js")

content = engine.read_text(encoding="utf-8")

needle = '''function transition(id, nextState, metadata = {}) {
'''

if needle not in content:
    raise SystemExit(
        "ERROR: transition() anchor not found. "
        "No engine modification performed."
    )

accept_function = r'''
// ============================================================
// ACCEPT RIDE
//
// Canonical driver acceptance operation.
//
// This is intentionally separate from generic transition().
// Acceptance has a concurrency-sensitive business rule:
// only one driver may claim a MATCHING ride.
//
// The repository owns the serialized state check + write.
// ============================================================

async function acceptRide(
    id,
    driverId,
    driverName
) {

    return repository.accept(
        id,
        driverId,
        driverName
    );
}

'''

content = content.replace(
    needle,
    accept_function + needle,
    1
)

export_needle = '''    transition,
    canTransition
};
'''

export_replacement = '''    transition,
    canTransition,
    acceptRide
};
'''

if export_needle not in content:
    raise SystemExit(
        "ERROR: engine export anchor not found."
    )

content = content.replace(
    export_needle,
    export_replacement,
    1
)

engine.write_text(content, encoding="utf-8")

print("PATCHED: backend/canonical/ride_engine.js")


# ============================================================
# 3. PATCH RIDE ROUTES
# ============================================================

routes = Path("backend/routes/rides.js")

content = routes.read_text(encoding="utf-8")

anchor = '''// ============================================================
// GET /api/rides
// Get all rides
// ============================================================
'''

if anchor not in content:
    raise SystemExit(
        "ERROR: ride route insertion anchor not found."
    )

accept_route = r'''// ============================================================
// PATCH /api/rides/:id/accept
//
// Canonical driver acceptance endpoint.
//
// Only the first valid acceptance of a MATCHING ride wins.
// A second acceptance returns HTTP 409.
// ============================================================

router.patch("/:id/accept", async (req, res) => {

    try {

        const {
            driverId,
            driverName
        } = req.body || {};

        if (!driverId) {

            return res.status(400).json({
                success: false,
                error: "Driver ID is required"
            });
        }

        const result =
            await rideEngine.acceptRide(
                req.params.id,
                driverId,
                driverName
            );

        if (!result.success) {

            if (result.code === "NOT_FOUND") {

                return res.status(404).json(
                    result
                );
            }

            if (
                result.code ===
                "ALREADY_ACCEPTED"
            ) {

                return res.status(409).json(
                    result
                );
            }

            return res.status(400).json(
                result
            );
        }

        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "❌ Ride acceptance error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to accept ride"
        });
    }
});


'''

content = content.replace(
    anchor,
    accept_route + anchor,
    1
)

routes.write_text(content, encoding="utf-8")

print("PATCHED: backend/routes/rides.js")


# ============================================================
# 4. PATCH HEALTH ROUTE
# ============================================================

app = Path("backend/server/app.js")

content = app.read_text(encoding="utf-8")

health_anchor = '''app.get(
"/health",
(req,res)=>{
'''

if health_anchor not in content:
    raise SystemExit(
        "ERROR: health route anchor not found."
    )

# Preserve existing /health and add explicit /api/health.
api_health = r'''

// Explicit API health endpoint.
// Required because Vercel exposes the backend beneath /api.

app.get(
"/api/health",
(req,res)=>{

res.json({

system:"CabLink API",

status:"ONLINE",

time:new Date().toISOString()

});

}
);

'''

# Insert after the existing /health route block by locating
# the first app.use("/api/rides"...) line.
rides_mount = 'app.use("/api/rides",rideRoutes);'

if rides_mount not in content:
    raise SystemExit(
        "ERROR: ride route mount anchor not found."
    )

content = content.replace(
    rides_mount,
    api_health + "\n" + rides_mount,
    1
)

app.write_text(content, encoding="utf-8")

print("PATCHED: backend/server/app.js")

PYEOF


echo
echo "============================================================"
echo " SYNTAX CHECK"
echo "============================================================"

node --check backend/canonical/ride_repository.js
node --check backend/canonical/ride_engine.js
node --check backend/routes/rides.js
node --check backend/server/app.js

echo "ALL SYNTAX CHECKS PASSED"


echo
echo "============================================================"
echo " ROUTE VERIFICATION"
echo "============================================================"

grep -nE \
'/:id/accept|acceptRide|repository.accept|/api/health' \
backend/routes/rides.js \
backend/canonical/ride_engine.js \
backend/canonical/ride_repository.js \
backend/server/app.js


echo
echo "============================================================"
echo " BLOCK 9 CANONICAL REPAIR COMPLETE"
echo "============================================================"

echo
echo "IMPORTANT:"
echo "The files were modified, but nothing has been committed."
echo "Nothing has been pushed."
echo "Nothing has been deployed."
echo
echo "Next step: run the local race-condition test."
