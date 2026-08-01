const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.56 — RUNTIME ROUTE REGISTRATION TRACE
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

function walk(dir) {

    const result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    for (
        const entry of fs.readdirSync(
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

            result.push(
                ...walk(target)
            );

        } else if (
            entry.isFile() &&
            entry.name.endsWith(".js")
        ) {

            result.push(target);

        }

    }

    return result;

}

function rel(file) {
    return path.relative(
        ROOT,
        file
    );
}

function resolveImport(
    fromFile,
    request
) {

    if (
        !request.startsWith(".")
    ) {

        return null;

    }

    const base =
        path.resolve(
            path.dirname(fromFile),
            request
        );

    const candidates = [

        base,

        `${base}.js`,

        `${base}.json`,

        path.join(
            base,
            "index.js"
        )

    ];

    for (
        const candidate
        of candidates
    ) {

        if (
            fs.existsSync(candidate) &&
            fs.statSync(candidate).isFile()
        ) {

            return candidate;

        }

    }

    return null;

}

function extractImports(
    file
) {

    const text =
        read(
            rel(file)
        );

    const results = [];

    const regex =
        /require\s*\(\s*["'`]([^"'`]+)["'`]\s*\)|import\s+(?:[^"'`]+?\s+from\s+)?["'`]([^"'`]+)["'`]/g;

    let match;

    while (
        (match = regex.exec(text))
    ) {

        results.push(
            match[1] ||
            match[2]
        );

    }

    return results;

}

const allFiles =
    walk(
        abs("backend")
    );

console.log(
    "BACKEND FILES:",
    allFiles.length
);


console.log(`
========================================================
A. STARTUP ENTRYPOINTS
========================================================
`);

const startupCandidates = [

    "backend/server.js",

    "backend/server/index.js",

    "backend/app.js",

    "backend/server/app.js"

];

for (
    const file of startupCandidates
) {

    if (
        exists(file)
    ) {

        console.log(
            `FOUND: ${file}`
        );

    }

}


console.log(`
========================================================
B. SERVER ROUTE REGISTRATIONS
========================================================
`);

const serverFiles =
    allFiles.filter(
        file =>
            /server\.js$|app\.js$|index\.js$/.test(
                rel(file)
            )
    );

const registrations = [];

for (
    const file of serverFiles
) {

    const lines =
        read(
            rel(file)
        ).split(/\r?\n/);

    lines.forEach(
        (line, index) => {

            if (
                /app\.use\s*\(/.test(line) ||
                /router\.use\s*\(/.test(line)
            ) {

                registrations.push({

                    file:
                        rel(file),

                    line:
                        index + 1,

                    code:
                        line.trim()

                });

            }

        }
    );

}

if (
    registrations.length === 0
) {

    console.log(
        "NO app.use/router.use REGISTRATIONS FOUND"
    );

} else {

    registrations.forEach(
        item => {

            console.log(
                `${item.file}:${item.line}`
            );

            console.log(
                `  ${item.code}`
            );

        }
    );

}


console.log(`
========================================================
C. RESOLVED ROUTER DEPENDENCY GRAPH
========================================================
`);

const visited =
    new Set();

const graph = [];

function trace(
    file,
    depth = 0
) {

    const key =
        path.resolve(file);

    if (
        visited.has(key)
    ) {

        return;

    }

    visited.add(key);

    const imports =
        extractImports(file);

    for (
        const request
        of imports
    ) {

        const resolved =
            resolveImport(
                file,
                request
            );

        if (
            !resolved
        ) {

            continue;

        }

        graph.push({

            from:
                rel(file),

            request,

            to:
                rel(resolved)

        });

        trace(
            resolved,
            depth + 1
        );

    }

}

for (
    const file
    of serverFiles
) {

    trace(file);

}

graph.forEach(
    edge => {

        console.log(
            `${edge.from}`
        );

        console.log(
            `  -> ${edge.request}`
        );

        console.log(
            `  -> ${edge.to}`
        );

    }
);


console.log(`
========================================================
D. RIDE ROUTE REACHABILITY
========================================================
`);

const rideKeywords = [

    "/api/rides",

    "ride/complete",

    "rewards/ride",

    "canonical_reward",

    "ride_engine",

    "ride_repository",

    "live_ride",

    "live_rides"

];

const rideGraph =
    graph.filter(
        edge =>
            rideKeywords.some(
                keyword =>
                    edge.from.includes(keyword) ||
                    edge.to.includes(keyword) ||
                    edge.request.includes(keyword)
            )
    );

if (
    rideGraph.length === 0
) {

    console.log(
        "NO RIDE GRAPH EDGES FOUND"
    );

} else {

    rideGraph.forEach(
        edge => {

            console.log(
                `${edge.from} -> ${edge.to}`
            );

        }
    );

}


console.log(`
========================================================
E. REPOSITORY REACHABILITY
========================================================
`);

const repositories = [

    "backend/canonical/ride_repository.js",

    "backend/database/ride_repository.js"

];

for (
    const repository
    of repositories
) {

    console.log(`
REPOSITORY:
${repository}
`);

    if (
        !exists(repository)
    ) {

        console.log(
            "STATUS: NOT FOUND"
        );

        continue;

    }

    const references =
        graph.filter(
            edge =>
                edge.to === repository
        );

    if (
        references.length === 0
    ) {

        console.log(
            "RUNTIME GRAPH REFERENCES: NONE"
        );

    } else {

        references.forEach(
            edge => {

                console.log(
                    `REACHABLE FROM: ${edge.from}`
                );

            }
        );

    }

}


console.log(`
========================================================
F. LEGACY LIVE RIDE REACHABILITY
========================================================
`);

const legacyTarget =
    "backend/services/live_ride_service.js";

const legacyReferences =
    graph.filter(
        edge =>
            edge.to === legacyTarget
    );

if (
    legacyReferences.length === 0
) {

    console.log(
        "live_ride_service.js: NOT REACHED FROM STARTUP IMPORT GRAPH"
    );

} else {

    legacyReferences.forEach(
        edge => {

            console.log(
                `REACHED FROM: ${edge.from}`
            );

        }
    );

}


console.log(`
========================================================
G. CANONICAL ENGINE REACHABILITY
========================================================
`);

const engineTarget =
    "backend/canonical/ride_engine.js";

const engineReferences =
    graph.filter(
        edge =>
            edge.to === engineTarget
    );

if (
    engineReferences.length === 0
) {

    console.log(
        "ride_engine.js: NOT REACHED FROM STARTUP IMPORT GRAPH"
    );

} else {

    engineReferences.forEach(
        edge => {

            console.log(
                `REACHED FROM: ${edge.from}`
            );

        }
    );

}


console.log(`
========================================================
H. O.8.56 VERDICT
========================================================

This test follows the ACTUAL STARTUP IMPORT GRAPH.

It attempts to distinguish:

ACTIVE:
  Loaded from backend startup

REACHABLE:
  Imported through the live dependency graph

ORPHANED:
  Exists but not reachable

DUPLICATE AUTHORITY:
  Multiple repository implementations reachable

LEGACY REACHABLE:
  Legacy ride implementation still connected

NO FILES MODIFIED.
NO FILES DELETED.

========================================================
O.8.56 COMPLETE
========================================================
`);
