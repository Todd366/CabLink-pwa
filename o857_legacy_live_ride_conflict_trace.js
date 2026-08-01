const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.57 — LEGACY LIVE RIDE CONFLICT TRACE
========================================================
`);

const ROOT = process.cwd();

function abs(file) {
    return path.join(ROOT, file);
}

function exists(file) {
    return fs.existsSync(abs(file));
}

function read(file) {
    try {
        return fs.readFileSync(abs(file), "utf8");
    } catch {
        return "";
    }
}

function lines(file) {
    return read(file).split(/\r?\n/);
}

function printFile(file) {

    console.log(`
--------------------------------------------------------
${file}
--------------------------------------------------------
`);

    if (!exists(file)) {
        console.log("FILE NOT FOUND");
        return;
    }

    lines(file).forEach(
        (line, index) => {

            console.log(
                `${String(index + 1).padStart(4, " ")} | ${line}`
            );

        }
    );

}

const targets = [

    "backend/server/app.js",

    "backend/routes/live_ride_api.js",

    "backend/services/live_ride_service.js",

    "backend/canonical/ride_engine.js",

    "backend/canonical/ride_repository.js",

    "backend/routes/rides.js",

    "backend/routes/completion_api.js",

    "backend/services/ride_completion_service.js",

    "backend/services/canonical_reward_service.js",

    "backend/database/ride_repository.js"

];

console.log(`
========================================================
A. ACTIVE LEGACY PATH
========================================================
`);

printFile(
    "backend/routes/live_ride_api.js"
);

printFile(
    "backend/services/live_ride_service.js"
);


console.log(`
========================================================
B. CANONICAL RIDE PATH
========================================================
`);

printFile(
    "backend/routes/rides.js"
);

printFile(
    "backend/canonical/ride_engine.js"
);


console.log(`
========================================================
C. COMPLETION / REWARD PATH
========================================================
`);

printFile(
    "backend/routes/completion_api.js"
);

printFile(
    "backend/services/ride_completion_service.js"
);

printFile(
    "backend/services/canonical_reward_service.js"
);


console.log(`
========================================================
D. DUPLICATE DATABASE REPOSITORY
========================================================
`);

printFile(
    "backend/database/ride_repository.js"
);


console.log(`
========================================================
E. LEGACY STORAGE REFERENCES
========================================================
`);

const backendFiles = [];

function walk(dir) {

    if (!fs.existsSync(dir)) {
        return;
    }

    for (
        const entry
        of fs.readdirSync(
            dir,
            { withFileTypes: true }
        )
    ) {

        const target =
            path.join(
                dir,
                entry.name
            );

        if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist"
        ) {
            continue;
        }

        if (
            entry.isDirectory()
        ) {

            walk(target);

        } else if (
            entry.isFile() &&
            entry.name.endsWith(".js")
        ) {

            backendFiles.push(target);

        }

    }

}

walk(
    abs("backend")
);

const legacyPatterns = [

    "live_ride_service",

    "live_rides.json",

    "liveRideRoutes",

    "/live",

    "liveRide",

    "createLiveRide",

    "updateLiveRide",

    "getLiveRide",

    "deleteLiveRide"

];

for (
    const file
    of backendFiles
) {

    const relative =
        path.relative(
            ROOT,
            file
        );

    const fileLines =
        read(relative).split(/\r?\n/);

    fileLines.forEach(
        (line, index) => {

            const matches =
                legacyPatterns.filter(
                    pattern =>
                        line.includes(pattern)
                );

            if (
                matches.length
            ) {

                console.log(`
${relative}:${index + 1}
PATTERNS: ${matches.join(", ")}
CODE: ${line.trim()}
`);

            }

        }
    );

}


console.log(`
========================================================
F. CANONICAL STATE REFERENCES
========================================================
`);

const canonicalPatterns = [

    "ride_engine",

    "ride_repository",

    "engine.transition",

    "repository.create",

    "repository.update",

    "repository.findById",

    "COMPLETED",

    "DRIVER_ASSIGNED",

    "DRIVER_ARRIVED",

    "PICKED_UP",

    "STARTED"

];

for (
    const file
    of backendFiles
) {

    const relative =
        path.relative(
            ROOT,
            file
        );

    const fileLines =
        read(relative).split(/\r?\n/);

    fileLines.forEach(
        (line, index) => {

            const matches =
                canonicalPatterns.filter(
                    pattern =>
                        line.includes(pattern)
                );

            if (
                matches.length
            ) {

                console.log(`
${relative}:${index + 1}
PATTERNS: ${matches.join(", ")}
CODE: ${line.trim()}
`);

            }

        }
    );

}


console.log(`
========================================================
G. O.8.57 CONFLICT QUESTIONS
========================================================

The evidence above will answer:

1. Does live_ride_service write ride state?

2. Does live_ride_service use live_rides.json?

3. Does live_ride_service create IDs that could
   overlap with canonical ride IDs?

4. Does live_ride_service expose ride lifecycle
   mutations?

5. Does live_ride_api expose endpoints that can
   modify canonical ride state?

6. Does the legacy system maintain a SECOND
   authoritative ride lifecycle?

7. Is it merely a read/monitoring subsystem?

8. Can it be safely disconnected from app.js?

9. Does any frontend code still call it?

10. Is backend/database/ride_repository.js
    genuinely orphaned?

========================================================
NO FILES MODIFIED.
NO FILES DELETED.

========================================================
O.8.57 COMPLETE
========================================================
`);

