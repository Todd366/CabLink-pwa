const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.52 — ACTIVE RUNTIME DEPENDENCY CLASSIFICATION
========================================================
`);

const ROOT = process.cwd();

const targets = [
    "backend/server/app.js",

    "backend/routes/live_ride_api.js",
    "backend/routes/rides.js",
    "backend/routes/completion_api.js",

    "backend/services/live_ride_service.js",
    "backend/services/dispatch_service.js",
    "backend/services/canonical_reward_service.js",
    "backend/services/driver_location_service.js",
    "backend/services/driver_matching_service.js",
    "backend/services/economy_ledger_service.js",
    "backend/services/identity_service.js",
    "backend/services/live_demand_service.js",
    "backend/services/passenger_intelligence_service.js",
    "backend/services/ride_event_service.js",
    "backend/services/ride_completion_service.js",
    "backend/services/ride_orchestrator_service.js",

    "backend/canonical/ride_engine.js",
    "backend/canonical/ride_repository.js"
];

const files = targets.filter(
    file =>
        fs.existsSync(
            path.join(ROOT, file)
        )
);

console.log(
    "TARGET FILES FOUND:",
    files.length,
    "/",
    targets.length
);

const records = [];

function add(
    file,
    category,
    line,
    code,
    detail
) {
    records.push({
        file,
        category,
        line,
        code,
        detail
    });
}

function resolveRequire(
    sourceFile,
    request
) {

    if (!request.startsWith(".")) {
        return null;
    }

    const base =
        path.resolve(
            ROOT,
            path.dirname(sourceFile),
            request
        );

    const candidates = [
        base,
        `${base}.js`,
        path.join(base, "index.js")
    ];

    for (const candidate of candidates) {

        if (fs.existsSync(candidate)) {

            return path.relative(
                ROOT,
                candidate
            );

        }

    }

    return null;
}

for (const file of files) {

    const full =
        path.join(
            ROOT,
            file
        );

    const text =
        fs.readFileSync(
            full,
            "utf8"
        );

    const lines =
        text.split("\n");

    lines.forEach(
        (line, index) => {

            const lineNumber =
                index + 1;

            /*
            ====================================================
            IMPORT / DEPENDENCY CLASSIFICATION
            ====================================================
            */

            const requireMatches =
                [
                    ...line.matchAll(
                        /require\s*\(\s*["']([^"']+)["']\s*\)/g
                    )
                ];

            for (
                const match
                of requireMatches
            ) {

                const request =
                    match[1];

                const resolved =
                    resolveRequire(
                        file,
                        request
                    );

                if (
                    resolved ===
                    "backend/canonical/ride_engine.js"
                ) {

                    add(
                        file,
                        "CANONICAL ENGINE DEPENDENCY",
                        lineNumber,
                        line.trim(),
                        resolved
                    );

                }

                else if (
                    resolved ===
                    "backend/canonical/ride_repository.js"
                ) {

                    add(
                        file,
                        "CANONICAL REPOSITORY DEPENDENCY",
                        lineNumber,
                        line.trim(),
                        resolved
                    );

                }

                else if (
                    resolved ===
                    "backend/database/rideRepository.js"
                ) {

                    add(
                        file,
                        "SECONDARY REPOSITORY DEPENDENCY",
                        lineNumber,
                        line.trim(),
                        resolved
                    );

                }

                else if (
                    resolved ===
                    "backend/ride_store.js"
                ) {

                    add(
                        file,
                        "RIDE STORE DEPENDENCY",
                        lineNumber,
                        line.trim(),
                        resolved
                    );

                }

                else if (
                    resolved ===
                    "backend/services/live_ride_service.js"
                ) {

                    add(
                        file,
                        "LEGACY LIVE RIDE DEPENDENCY",
                        lineNumber,
                        line.trim(),
                        resolved
                    );

                }

            }

            /*
            ====================================================
            RIDE STATE WRITE DETECTION
            ====================================================
            */

            if (
                /\b(ride|request|r)\.status\s*=/.test(
                    line
                )
            ) {

                add(
                    file,
                    "RIDE STATE WRITE",
                    lineNumber,
                    line.trim(),
                    "Potential direct ride lifecycle mutation"
                );

            }

            if (
                /\b(ride|request|r)\.(driverId|driverName|acceptedAt|completedAt)\s*=/.test(
                    line
                )
            ) {

                add(
                    file,
                    "RIDE ATTRIBUTE WRITE",
                    lineNumber,
                    line.trim(),
                    "Potential direct ride attribute mutation"
                );

            }

            /*
            ====================================================
            REPOSITORY WRITE DETECTION
            ====================================================
            */

            if (
                /repository\.(create|update)\s*\(/.test(
                    line
                )
            ) {

                add(
                    file,
                    "CANONICAL REPOSITORY WRITE",
                    lineNumber,
                    line.trim(),
                    "Writes through canonical repository"
                );

            }

            /*
            ====================================================
            ENGINE TRANSITION DETECTION
            ====================================================
            */

            if (
                /engine\.transition\s*\(/.test(
                    line
                )
            ) {

                add(
                    file,
                    "CANONICAL STATE TRANSITION",
                    lineNumber,
                    line.trim(),
                    "Ride lifecycle transition through canonical engine"
                );

            }

            /*
            ====================================================
            STORAGE TARGET DETECTION
            ====================================================
            */

            const storageMatches =
                [
                    ...line.matchAll(
                        /["'`]([^"'`]*(?:rides|ride_events|live_rides|drivers|locations|demand|identity|ledger|intelligence)[^"'`]*)["'`]/gi
                    )
                ];

            for (
                const match
                of storageMatches
            ) {

                const target =
                    match[1];

                if (
                    target.includes(
                        "live_rides.json"
                    )
                ) {

                    add(
                        file,
                        "LEGACY LIVE RIDE STORAGE",
                        lineNumber,
                        line.trim(),
                        target
                    );

                }

                else if (
                    target.includes(
                        "rides.json"
                    )
                ) {

                    add(
                        file,
                        "RIDE STORAGE TARGET",
                        lineNumber,
                        line.trim(),
                        target
                    );

                }

                else if (
                    target.includes(
                        "ride_events"
                    )
                ) {

                    add(
                        file,
                        "RIDE EVENT STORAGE",
                        lineNumber,
                        line.trim(),
                        target
                    );

                }

            }

            /*
            ====================================================
            ROUTE REGISTRATION
            ====================================================
            */

            if (
                /app\.use\s*\(/.test(
                    line
                )
            ) {

                if (
                    /liveRideRoutes/.test(
                        line
                    )
                ) {

                    add(
                        file,
                        "LIVE RIDE ROUTE MOUNT",
                        lineNumber,
                        line.trim(),
                        "Active legacy route registration"
                    );

                }

                if (
                    /completionRoutes/.test(
                        line
                    )
                ) {

                    add(
                        file,
                        "COMPLETION ROUTE MOUNT",
                        lineNumber,
                        line.trim(),
                        "Active ride completion route"
                    );

                }

                if (
                    /rideRoutes/.test(
                        line
                    )
                ) {

                    add(
                        file,
                        "CANONICAL RIDE ROUTE MOUNT",
                        lineNumber,
                        line.trim(),
                        "Active ride API route"
                    );

                }

            }

        }

    );

}

/*
============================================================
PRINT CLASSIFICATION
============================================================
*/

function section(
    title,
    categories
) {

    console.log(`
========================================================
${title}
========================================================
`);

    const matches =
        records.filter(
            r =>
                categories.includes(
                    r.category
                )
        );

    if (
        matches.length === 0
    ) {

        console.log(
            "NONE DETECTED"
        );

        return;

    }

    matches.forEach(
        r => {

            console.log(
                `${r.file}:${r.line}`
            );

            console.log(
                `  [${r.category}]`
            );

            console.log(
                `  ${r.code}`
            );

            console.log(
                `  -> ${r.detail}`
            );

            console.log();

        }
    );

}

/*
============================================================
A. CANONICAL AUTHORITY
============================================================
*/

section(
    "A. CANONICAL RIDE AUTHORITY",
    [
        "CANONICAL ENGINE DEPENDENCY",
        "CANONICAL REPOSITORY DEPENDENCY",
        "CANONICAL REPOSITORY WRITE",
        "CANONICAL STATE TRANSITION"
    ]
);

/*
============================================================
B. LEGACY LIVE RIDE
============================================================
*/

section(
    "B. LEGACY LIVE RIDE PATH",
    [
        "LEGACY LIVE RIDE DEPENDENCY",
        "LEGACY LIVE RIDE STORAGE",
        "LIVE RIDE ROUTE MOUNT"
    ]
);

/*
============================================================
C. SECONDARY REPOSITORY
============================================================
*/

section(
    "C. SECONDARY RIDE REPOSITORY",
    [
        "SECONDARY REPOSITORY DEPENDENCY",
        "RIDE STORE DEPENDENCY"
    ]
);

/*
============================================================
D. DIRECT RIDE STATE WRITES
============================================================
*/

section(
    "D. DIRECT RIDE STATE MUTATIONS",
    [
        "RIDE STATE WRITE",
        "RIDE ATTRIBUTE WRITE"
    ]
);

/*
============================================================
E. RIDE STORAGE
============================================================
*/

section(
    "E. RIDE STORAGE TARGETS",
    [
        "RIDE STORAGE TARGET",
        "RIDE EVENT STORAGE"
    ]
);

/*
============================================================
F. ACTIVE ROUTES
============================================================
*/

section(
    "F. ACTIVE ROUTE REGISTRATION",
    [
        "CANONICAL RIDE ROUTE MOUNT",
        "COMPLETION ROUTE MOUNT",
        "LIVE RIDE ROUTE MOUNT"
    ]
);

/*
============================================================
FILE-LEVEL CLASSIFICATION
============================================================
*/

console.log(`
========================================================
O.8.52 FILE-LEVEL CLASSIFICATION
========================================================
`);

const classifications = {};

for (const file of files) {

    const fileRecords =
        records.filter(
            r =>
                r.file === file
        );

    const categories =
        new Set(
            fileRecords.map(
                r =>
                    r.category
            )
        );

    let classification =
        "INDEPENDENT / NO CANONICAL RIDE STATE WRITE DETECTED";

    if (
        categories.has(
            "CANONICAL ENGINE DEPENDENCY"
        ) ||
        categories.has(
            "CANONICAL STATE TRANSITION"
        ) ||
        categories.has(
            "CANONICAL REPOSITORY WRITE"
        )
    ) {

        classification =
            "CANONICAL RIDE AUTHORITY";

    }

    if (
        categories.has(
            "LEGACY LIVE RIDE DEPENDENCY"
        ) ||
        categories.has(
            "LEGACY LIVE RIDE STORAGE"
        ) ||
        categories.has(
            "LIVE RIDE ROUTE MOUNT"
        )
    ) {

        classification =
            "LEGACY LIVE RIDE — ACTIVE RUNTIME CONFLICT";

    }

    if (
        categories.has(
            "RIDE STATE WRITE"
        ) ||
        categories.has(
            "RIDE ATTRIBUTE WRITE"
        )
    ) {

        classification =
            "DIRECT RIDE STATE MUTATOR — REQUIRES MIGRATION";

    }

    if (
        categories.has(
            "SECONDARY REPOSITORY DEPENDENCY"
        ) ||
        categories.has(
            "RIDE STORE DEPENDENCY"
        )
    ) {

        classification =
            "SECONDARY RIDE STORAGE — REQUIRES MIGRATION / RETIREMENT";

    }

    classifications[file] =
        classification;

    console.log(
        `${classification}\n  ${file}`
    );

}

/*
============================================================
O.8.52 SUMMARY
============================================================
*/

console.log(`
========================================================
O.8.52 SUMMARY
========================================================
`);

const summaryCounts = {};

for (
    const classification
    of Object.values(
        classifications
    )
) {

    summaryCounts[classification] =
        (
            summaryCounts[classification] ||
            0
        ) + 1;

}

for (
    const [
        classification,
        count
    ]
    of Object.entries(
        summaryCounts
    )
) {

    console.log(
        `${count} — ${classification}`
    );

}

/*
============================================================
TARGETED NEXT ACTIONS
============================================================
*/

console.log(`
========================================================
O.8.52 TARGETED NEXT ACTIONS
========================================================
`);

const legacyConflict =
    records.filter(
        r =>
            r.category ===
                "LEGACY LIVE RIDE DEPENDENCY" ||
            r.category ===
                "LEGACY LIVE RIDE STORAGE" ||
            r.category ===
                "LIVE RIDE ROUTE MOUNT"
    );

const directMutations =
    records.filter(
        r =>
            r.category ===
                "RIDE STATE WRITE" ||
            r.category ===
                "RIDE ATTRIBUTE WRITE"
    );

const secondary =
    records.filter(
        r =>
            r.category ===
                "SECONDARY REPOSITORY DEPENDENCY" ||
            r.category ===
                "RIDE STORE DEPENDENCY"
    );

console.log(
    "LEGACY LIVE RIDE FINDINGS:",
    legacyConflict.length
);

console.log(
    "DIRECT RIDE MUTATION FINDINGS:",
    directMutations.length
);

console.log(
    "SECONDARY STORAGE FINDINGS:",
    secondary.length
);

console.log(`
========================================================
O.8.52 VERDICT
========================================================
`);

if (
    legacyConflict.length === 0 &&
    directMutations.length === 0 &&
    secondary.length === 0
) {

    console.log(`
PASS

The inspected runtime files contain no detected
competing ride-state authority.

NEXT:
Proceed to end-to-end canonical lifecycle verification.
`);

} else {

    console.log(`
AUDIT REQUIRED

The runtime classification has isolated the remaining
authority conflicts.

DO NOT DELETE FILES YET.

NEXT:
1. Disconnect legacy live-ride route.
2. Migrate direct ride-state mutations.
3. Confirm every ride lifecycle write reaches
   backend/canonical/ride_engine.js.
4. Re-run the authority trace.
5. Only then consider retirement of unused legacy files.
`);

}

console.log(`
========================================================
O.8.52 COMPLETE
========================================================
`);

