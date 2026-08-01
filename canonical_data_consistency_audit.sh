#!/usr/bin/env bash

set -e

echo "============================================================"
echo "CABLINK — CANONICAL RIDE DATA CONSISTENCY AUDIT"
echo "============================================================"

echo
echo "============================================================"
echo "1. CANONICAL STATE DEFINITIONS"
echo "============================================================"

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");

console.log(
    JSON.stringify(engine.STATES, null, 2)
);
NODE

echo
echo "============================================================"
echo "2. CANONICAL RIDE STATUS DISTRIBUTION"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const counts = {};

for (const ride of rides) {
    const status = ride.status ?? "<MISSING>";

    counts[status] =
        (counts[status] || 0) + 1;
}

console.log(
    JSON.stringify(counts, null, 2)
);
NODE

echo
echo "============================================================"
echo "3. NON-CANONICAL STATUS VALUES"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");
const engine = require("./backend/canonical/ride_engine");

const rides = repo.all();

const validStates =
    new Set(Object.values(engine.STATES));

let found = false;

for (const ride of rides) {

    if (!validStates.has(ride.status)) {

        found = true;

        console.log(
            JSON.stringify(
                {
                    id: ride.id,
                    status: ride.status,
                    createdAt: ride.createdAt,
                    updatedAt: ride.updatedAt,
                    fullRide: ride
                },
                null,
                2
            )
        );
    }
}

if (!found) {
    console.log(
        "No non-canonical ride statuses found."
    );
}
NODE

echo
echo "============================================================"
echo "4. MISSING REQUIRED CORE FIELDS"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const required = [
    "id",
    "status",
    "createdAt"
];

let problems = 0;

for (const ride of rides) {

    const missing =
        required.filter(
            field =>
                ride[field] === undefined ||
                ride[field] === null ||
                ride[field] === ""
        );

    if (missing.length > 0) {

        problems++;

        console.log(
            JSON.stringify(
                {
                    id: ride.id,
                    missing
                },
                null,
                2
            )
        );
    }
}

if (problems === 0) {
    console.log(
        "All rides contain required core fields."
    );
} else {
    console.log(
        "Rides with missing fields:",
        problems
    );
}
NODE

echo
echo "============================================================"
echo "5. DUPLICATE RIDE IDS"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const ids = new Map();

for (const ride of rides) {

    if (!ids.has(ride.id)) {
        ids.set(ride.id, []);
    }

    ids.get(ride.id).push(ride);
}

let duplicates = 0;

for (const [id, entries] of ids) {

    if (entries.length > 1) {

        duplicates++;

        console.log(
            "DUPLICATE ID:",
            id,
            "COUNT:",
            entries.length
        );
    }
}

if (duplicates === 0) {
    console.log(
        "No duplicate ride IDs found."
    );
}
NODE

echo
echo "============================================================"
echo "6. CANONICAL RIDE ID FORMAT DISTRIBUTION"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

const patterns = {};

for (const ride of rides) {

    let pattern = "UNKNOWN";

    if (/^CL-[A-Z0-9]+$/.test(String(ride.id))) {
        pattern = "CL-*";
    }

    if (/^RIDE-[0-9]+$/.test(String(ride.id))) {
        pattern = "RIDE-*";
    }

    patterns[pattern] =
        (patterns[pattern] || 0) + 1;
}

console.log(
    JSON.stringify(patterns, null, 2)
);
NODE

echo
echo "============================================================"
echo "7. FULL CANONICAL RIDE SCHEMA SAMPLE"
echo "============================================================"

node - <<'NODE'
const repo = require("./backend/canonical/ride_repository");

const rides = repo.all();

for (const ride of rides.slice(0, 5)) {

    console.log(
        JSON.stringify(
            ride,
            null,
            2
        )
    );
}
NODE

echo
echo "============================================================"
echo "8. CANONICAL REPOSITORY FILE"
echo "============================================================"

grep -nE \
'function |module\.exports|create|findById|all|update|accept|FILE|load|save' \
backend/canonical/ride_repository.js \
|| true

echo
echo "============================================================"
echo "9. CANONICAL ENGINE RIDE CREATION"
echo "============================================================"

sed -n '40,105p' \
backend/canonical/ride_engine.js

echo
echo "============================================================"
echo "10. CANONICAL DATA CONSISTENCY AUDIT COMPLETE"
echo "============================================================"

echo
echo "NO FILES WERE MODIFIED."
echo "NO FILES WERE DELETED."
echo "NO DATA WAS MIGRATED."

