const fs = require("fs");
const path = require("path");

console.log(`
==============================================
CABLINK O.8.50 — RUNTIME RIDE AUTHORITY TRACE
==============================================
`);

const ROOT = process.cwd();

const files = [];

function walk(dir) {

    if (!fs.existsSync(dir)) {
        return;
    }

    for (const entry of fs.readdirSync(
        dir,
        { withFileTypes: true }
    )) {

        const full =
            path.join(
                dir,
                entry.name
            );

        if (entry.isDirectory()) {

            if (
                entry.name !== "node_modules" &&
                entry.name !== ".git"
            ) {

                walk(full);

            }

        } else if (
            path.extname(entry.name) === ".js"
        ) {

            files.push(
                path.relative(
                    ROOT,
                    full
                )
            );

        }

    }

}

walk(ROOT);

const source = new Map();

for (const file of files) {

    const full =
        path.join(
            ROOT,
            file
        );

    try {

        source.set(
            file,
            fs.readFileSync(
                full,
                "utf8"
            )
        );

    } catch {}

}


function findMatches(
    regex
) {

    const results = [];

    for (
        const [file, text]
        of source
    ) {

        const lines =
            text.split("\n");

        lines.forEach(
            (line, index) => {

                regex.lastIndex = 0;

                if (
                    regex.test(line)
                ) {

                    results.push({

                        file,

                        line:
                            index + 1,

                        code:
                            line.trim()

                    });

                }

            }
        );

    }

    return results;

}


function printSection(
    title,
    results
) {

    console.log(`
==============================================
${title}
==============================================
`);

    if (
        results.length === 0
    ) {

        console.log(
            "NONE DETECTED"
        );

        return;

    }

    results.forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                x.code
            )
    );

}


/*
================================================
1. CANONICAL REPOSITORY REFERENCES
================================================
*/

const canonicalRepository =
    findMatches(
        /canonical\/ride_repository|canonical\/ride_engine|rideRepository/g
    );

printSection(
    "1. CANONICAL REPOSITORY / ENGINE REFERENCES",
    canonicalRepository
);


/*
================================================
2. SECOND DATABASE REPOSITORY REFERENCES
================================================
*/

const databaseRepository =
    findMatches(
        /database\/ride_repository/g
    );

printSection(
    "2. DATABASE RIDE REPOSITORY REFERENCES",
    databaseRepository
);


/*
================================================
3. CANONICAL ENGINE IMPORTS / CALLS
================================================
*/

const engineUsage =
    findMatches(
        /require\s*\(\s*["'][^"']*canonical\/ride_engine|engine\.(createRide|transition|getRide|find|update)/g
    );

printSection(
    "3. CANONICAL ENGINE RUNTIME USAGE",
    engineUsage
);


/*
================================================
4. SECOND REPOSITORY MUTATION / READ METHODS
================================================
*/

const databaseRepoMethods =
    findMatches(
        /rideRepository\.(create|update|find|findById|get|save|delete)|rides\.(create|update|find|findById|get|save|delete)/g
    );

printSection(
    "4. DATABASE REPOSITORY METHOD USAGE",
    databaseRepoMethods
);


/*
================================================
5. LIVE RIDE LEGACY REFERENCES
================================================
*/

const liveRide =
    findMatches(
        /live_ride_service|live_rides\.json|live_ride_api/g
    );

printSection(
    "5. LEGACY LIVE RIDE REFERENCES",
    liveRide
);


/*
================================================
6. ACTIVE RIDE API ROUTES
================================================
*/

const rideRoutes =
    findMatches(
        /router\.(get|post|patch|put|delete)\s*\(|app\.(get|post|patch|put|delete)\s*\(/g
    )
    .filter(
        x =>
            /ride/i.test(
                x.code
            )
    );

printSection(
    "6. RIDE-RELATED ROUTE DEFINITIONS",
    rideRoutes
);


/*
================================================
7. ROUTE REGISTRATION
================================================
*/

const routeRegistration =
    findMatches(
        /app\.use\s*\(|router\.use\s*\(/g
    )
    .filter(
        x =>
            /ride|completion|economy|reward|orchestrator|canonical|live/i.test(
                x.code
            )
    );

printSection(
    "7. RIDE-RELATED ROUTE REGISTRATION",
    routeRegistration
);


/*
================================================
8. DIRECT RIDE JSON FILE ACCESS
================================================
*/

const directRideStorage =
    findMatches(
        /fs\.(readFileSync|writeFileSync|appendFileSync).*ride|["'`][^"'`]*ride[^"'`]*\.json["'`]/gi
    );

printSection(
    "8. DIRECT RIDE JSON STORAGE ACCESS",
    directRideStorage
);


/*
================================================
9. RIDE STATE MUTATIONS
================================================
*/

const rideStateMutations =
    findMatches(
        /\b(ride|r)\.(status|driverId|driverName|completedAt|acceptedAt)\s*=/g
    );

printSection(
    "9. RIDE OBJECT STATE MUTATIONS",
    rideStateMutations
);


/*
================================================
10. COMPLETION PATHS
================================================
*/

const completionPaths =
    findMatches(
        /ride\/complete|completeRide|complete_ride|status\s*[:=]\s*["']COMPLETED["']/g
    );

printSection(
    "10. COMPLETION PATH REFERENCES",
    completionPaths
);


/*
================================================
11. RUNTIME AUTHORITY CLASSIFICATION
================================================
*/

console.log(`
==============================================
11. O.8.50 AUTHORITY CLASSIFICATION
==============================================
`);

const canonicalFiles =
    [
        ...new Set(
            canonicalRepository.map(
                x => x.file
            )
        )
    ];

const databaseFiles =
    [
        ...new Set(
            databaseRepository.map(
                x => x.file
            )
        )
    ];

const liveFiles =
    [
        ...new Set(
            liveRide.map(
                x => x.file
            )
        )
    ];

const mutationFiles =
    [
        ...new Set(
            rideStateMutations.map(
                x => x.file
            )
        )
    ];

console.log(
    "CANONICAL REFERENCES:",
    canonicalFiles.length
);

console.log(
    "DATABASE REPOSITORY REFERENCES:",
    databaseFiles.length
);

console.log(
    "LEGACY LIVE RIDE REFERENCES:",
    liveFiles.length
);

console.log(
    "RIDE STATE MUTATION FILES:",
    mutationFiles.length
);


console.log(`
----------------------------------------------
AUTHORITY QUESTIONS
----------------------------------------------
`);

if (
    databaseFiles.length > 0
) {

    console.log(
        "⚠ SECOND RIDE REPOSITORY REFERENCES DETECTED"
    );

} else {

    console.log(
        "✓ NO SECOND RIDE REPOSITORY REFERENCES DETECTED"
    );

}


if (
    liveFiles.length > 0
) {

    console.log(
        "⚠ LEGACY LIVE RIDE REFERENCES DETECTED"
    );

} else {

    console.log(
        "✓ NO LEGACY LIVE RIDE REFERENCES DETECTED"
    );

}


if (
    canonicalFiles.length > 0
) {

    console.log(
        "✓ CANONICAL ENGINE / REPOSITORY PATH DETECTED"
    );

} else {

    console.log(
        "✗ CANONICAL ENGINE PATH NOT DETECTED"
    );

}


console.log(`
==============================================
12. O.8.50 FINAL RESULT
==============================================
`);

if (
    canonicalFiles.length > 0 &&
    databaseFiles.length === 0 &&
    liveFiles.length === 0
) {

    console.log(`
PASS

SINGLE RIDE AUTHORITY:
VERIFIED

CANONICAL ENGINE:
ACTIVE

SECOND RIDE REPOSITORY:
NOT DETECTED

LEGACY LIVE RIDE:
NOT DETECTED

NEXT:
PROCEED TO DEEPER LIFECYCLE AUDIT
`);

} else {

    console.log(`
AUDIT REQUIRED

CANONICAL ENGINE:
${canonicalFiles.length > 0
    ? "DETECTED"
    : "NOT DETECTED"}

SECOND RIDE REPOSITORY:
${databaseFiles.length > 0
    ? "DETECTED"
    : "NOT DETECTED"}

LEGACY LIVE RIDE:
${liveFiles.length > 0
    ? "DETECTED"
    : "NOT DETECTED"}

NEXT:
TRACE THE SPECIFIC FILES ABOVE.
DO NOT DELETE ANYTHING YET.
`);

}


console.log(`
==============================================
O.8.50 COMPLETE
==============================================
`);

