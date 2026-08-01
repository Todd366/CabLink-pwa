#!/usr/bin/env bash

set -e

echo "============================================================"
echo "CABLINK — CANONICAL RIDE STATUS NORMALIZATION"
echo "============================================================"

BACKUP="backend/data/rides.json.before-status-normalization-$(date +%Y%m%d-%H%M%S)"

echo
echo "1. CREATING DATA BACKUP"
echo "============================================================"

cp backend/data/rides.json "$BACKUP"

echo "Backup created:"
echo "$BACKUP"

echo
echo "2. NORMALIZING LOWERCASE REQUESTED STATUS"
echo "============================================================"

node - <<'NODE'
const fs = require("fs");

const file = "./backend/data/rides.json";

const rides = JSON.parse(
    fs.readFileSync(file, "utf8")
);

let changed = 0;

for (const ride of rides) {

    if (ride.status === "requested") {

        console.log(
            "NORMALIZE:",
            ride.id,
            "requested -> REQUESTED"
        );

        ride.status = "REQUESTED";

        if (!ride.updatedAt) {
            ride.updatedAt = ride.createdAt;
        }

        changed++;
    }
}

fs.writeFileSync(
    file,
    JSON.stringify(rides, null, 2),
    "utf8"
);

console.log();
console.log(
    "Statuses normalized:",
    changed
);

if (changed !== 4) {
    console.warn(
        "WARNING: Expected 4 lowercase requested rides."
    );
}
NODE

echo
echo "3. VERIFYING CANONICAL DATA"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");
const engine = require("./backend/canonical/ride_engine");

const rides = repo.all();

const validStates =
    new Set(Object.values(engine.STATES));

const invalid =
    rides.filter(
        ride => !validStates.has(ride.status)
    );

const lowercase =
    rides.filter(
        ride => ride.status === "requested"
    );

console.log("Total rides:", rides.length);
console.log("Invalid statuses:", invalid.length);
console.log("Lowercase requested statuses:", lowercase.length);

if (invalid.length > 0) {
    console.error(
        "FAIL: Invalid canonical statuses remain."
    );

    for (const ride of invalid) {
        console.error({
            id: ride.id,
            status: ride.status
        });
    }

    process.exit(1);
}

if (lowercase.length > 0) {
    console.error(
        "FAIL: Lowercase requested statuses remain."
    );

    process.exit(1);
}

console.log(
    "PASS: All ride statuses match canonical STATES."
);
NODE

echo
echo "4. STATUS DISTRIBUTION"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const counts = {};

for (const ride of rides) {
    counts[ride.status] =
        (counts[ride.status] || 0) + 1;
}

console.log(
    JSON.stringify(counts, null, 2)
);
NODE

echo
echo "5. FINAL VERIFICATION"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const ids = new Set();

let duplicateIds = 0;

for (const ride of rides) {

    if (ids.has(ride.id)) {
        duplicateIds++;
        console.error(
            "DUPLICATE ID:",
            ride.id
        );
    }

    ids.add(ride.id);
}

console.log("Ride count:", rides.length);
console.log("Unique IDs:", ids.size);
console.log("Duplicate IDs:", duplicateIds);

if (rides.length !== ids.size) {
    process.exit(1);
}

console.log(
    "PASS: All canonical ride IDs remain unique."
);
NODE

echo
echo "============================================================"
echo "STATUS NORMALIZATION COMPLETE"
echo "============================================================"

echo
echo "Backup:"
echo "$BACKUP"

echo
echo "Modified:"
echo "backend/data/rides.json"

echo
echo "Next architectural step:"
echo "Migrate ride_state_service.js through the compatibility layer."

