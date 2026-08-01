const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function file(p) {
    const full = path.join(ROOT, p);
    console.log(`\n============================================================`);
    console.log(`FILE: ${p}`);
    console.log(`============================================================`);

    if (!fs.existsSync(full)) {
        console.log("MISSING");
        return "";
    }

    const text = fs.readFileSync(full, "utf8");
    console.log(text);
    return text;
}

function imports(text, target) {
    return text.includes(target);
}

console.log(`
######################################################################
CABLINK — EXACT PRODUCTION RIDE SOURCE-OF-TRUTH TRACE
READ-ONLY — NO FILES MODIFIED
######################################################################
`);

console.log("\n============================================================");
console.log("1. FRONTEND RIDE CREATION TARGETS");
console.log("============================================================");

const frontendTargets = [
    "frontend/js/rides/rideController.js",
    "frontend/js/rides/rideService.js",
    "frontend/js/app_core.js",
    "frontend/index.html",
    "frontend/App.jsx",
    "frontend/pages/PassengerRide.jsx"
];

for (const p of frontendTargets) {
    const full = path.join(ROOT, p);

    if (!fs.existsSync(full)) {
        console.log(`\nMISSING: ${p}`);
        continue;
    }

    const text = fs.readFileSync(full, "utf8");

    const lines = text.split("\n");

    console.log(`\n--- ${p} ---`);

    lines.forEach((line, i) => {
        if (
            /fetch\s*\(/.test(line) ||
            /api\s*\(/.test(line) ||
            /\/api\/rides/.test(line) ||
            /\/api\/ride\//.test(line) ||
            /\/api\/dispatch/.test(line)
        ) {
            console.log(`${i + 1}: ${line.trim()}`);
        }
    });
}

console.log("\n============================================================");
console.log("2. EXACT FRONTEND RIDE CREATION FUNCTIONS");
console.log("============================================================");

file("frontend/js/rides/rideController.js");
file("frontend/js/rides/rideService.js");

console.log("\n============================================================");
console.log("3. ACTIVE BACKEND SERVER ENTRYPOINT");
console.log("============================================================");

file("backend/server.js");

console.log("\n============================================================");
console.log("4. ACTIVE EXPRESS APP");
console.log("============================================================");

const appText = file("backend/server/app.js");

console.log("\n============================================================");
console.log("5. ACTIVE ROUTE REGISTRATION");
console.log("============================================================");

const routeFiles = [
    "backend/routes/rides.js",
    "backend/routes/live_ride_api.js",
    "backend/routes/ride_state_api.js",
    "backend/routes/dispatch_api.js"
];

for (const p of routeFiles) {
    file(p);
}

console.log("\n============================================================");
console.log("6. CANONICAL RIDE ENGINE");
console.log("============================================================");

file("backend/canonical/ride_engine.js");

console.log("\n============================================================");
console.log("7. CANONICAL RIDE REPOSITORY");
console.log("============================================================");

file("backend/canonical/ride_repository.js");

console.log("\n============================================================");
console.log("8. FIRESTORE TEST REPOSITORY");
console.log("============================================================");

file("backend/canonical/ride_repository_firestore_test.js");

console.log("\n============================================================");
console.log("9. PRODUCTION DATABASE ADAPTER");
console.log("============================================================");

file("backend/production/database_adapter.js");

console.log("\n============================================================");
console.log("10. FIRESTORE ADAPTER");
console.log("============================================================");

file("backend/firebase/firestore_adapter.js");

console.log("\n============================================================");
console.log("11. LEGACY RIDE REPOSITORIES");
console.log("============================================================");

file("backend/database/ride_repository.js");
file("backend/database/rideRepository.js");
file("backend/ride_store.js");

console.log("\n============================================================");
console.log("12. ALL ACTIVE IMPORTS INTO RIDE REPOSITORIES");
console.log("============================================================");

function searchRepo(targets) {
    const skip = new Set([
        "node_modules",
        ".git",
        "_audit_backups",
        "backups",
        "archive"
    ]);

    function walk(dir) {
        let entries;

        try {
            entries = fs.readdirSync(dir, {
                withFileTypes: true
            });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (skip.has(entry.name)) continue;

            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(full);
                continue;
            }

            if (!/\.(js|jsx|ts|tsx|json)$/.test(entry.name)) {
                continue;
            }

            let text;

            try {
                text = fs.readFileSync(full, "utf8");
            } catch {
                continue;
            }

            for (const target of targets) {
                if (text.includes(target)) {
                    console.log(
                        path.relative(ROOT, full),
                        "=>",
                        target
                    );
                }
            }
        }
    }

    walk(ROOT);
}

searchRepo([
    "canonical/ride_repository",
    "database/ride_repository",
    "database/rideRepository",
    "ride_store",
    "production/database_adapter",
    "ride_repository_firestore_test"
]);

console.log("\n============================================================");
console.log("13. ALL RIDE CREATION CALLS");
console.log("============================================================");

searchRepo([
    "rideEngine.create",
    "rides.create",
    "repository.create",
    "rideRepository.create",
    "rideRepository.createRide",
    "rideStore.create",
    "liveRide",
    "/api/rides",
    "/api/rides/request",
    "/api/ride/"
]);

console.log("\n============================================================");
console.log("14. ALL RIDE ACCEPTANCE CALLS");
console.log("============================================================");

searchRepo([
    "rideEngine.acceptRide",
    "repository.accept",
    "dispatch.accept",
    "economy.accept",
    "/api/rides/:id/accept",
    "/api/dispatch/accept",
    "/api/economy/ride/accept"
]);

console.log("\n============================================================");
console.log("15. DATABASE DESTINATIONS");
console.log("============================================================");

const destinations = [
    "backend/data/rides.json",
    "backend/storage/cablink_db.json",
    "backend/firebase/firestore_adapter.js",
    "backend/production/database_adapter.js"
];

for (const p of destinations) {
    const full = path.join(ROOT, p);

    console.log(
        p,
        fs.existsSync(full)
            ? "EXISTS"
            : "MISSING"
    );
}

console.log("\n============================================================");
console.log("16. CANONICAL REPOSITORY FIRESTORE DEPENDENCY TEST");
console.log("============================================================");

const canonical = path.join(
    ROOT,
    "backend/canonical/ride_repository.js"
);

if (fs.existsSync(canonical)) {
    const text = fs.readFileSync(canonical, "utf8");

    console.log(
        "Imports production database adapter:",
        imports(
            text,
            "../production/database_adapter"
        )
    );

    console.log(
        "Imports Firestore adapter:",
        imports(
            text,
            "../firebase/firestore_adapter"
        )
    );

    console.log(
        "Uses filesystem:",
        imports(text, "require(\"fs\")") ||
        imports(text, "require('fs')")
    );

    console.log(
        "References rides.json:",
        imports(text, "rides.json")
    );
}

console.log("\n============================================================");
console.log("17. RIDE ENGINE REPOSITORY DEPENDENCY TEST");
console.log("============================================================");

const enginePath = path.join(
    ROOT,
    "backend/canonical/ride_engine.js"
);

if (fs.existsSync(enginePath)) {
    const text = fs.readFileSync(enginePath, "utf8");

    console.log(
        "Imports canonical repository:",
        text.includes("./ride_repository") ||
        text.includes("./ride_repository.js")
    );

    console.log(
        "Imports Firestore repository directly:",
        text.includes("ride_repository_firestore_test")
    );

    console.log(
        "Imports production DB adapter directly:",
        text.includes("../production/database_adapter")
    );
}

console.log("\n============================================================");
console.log("18. FINAL STATIC VERDICT");
console.log("============================================================");

console.log(`
The trace above must establish:

A. Which frontend function creates a ride.
B. Which HTTP endpoint it calls.
C. Which Express router receives it.
D. Which service/engine handles it.
E. Which repository receives create().
F. Which database actually stores it.
G. Which acceptance endpoint handles driver acceptance.
H. Which repository receives accept().
I. Whether the production ride path reaches Firestore.
J. Whether the Firestore lifecycle test is separate from production.
`);

console.log(`
######################################################################
TRACE COMPLETE
NO FILES MODIFIED
NO COMMIT
NO PUSH
NO DEPLOYMENT
######################################################################
`);
