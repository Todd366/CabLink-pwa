'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

console.log(`
============================================================
CABLINK O.8.54 — FRONTEND → CANONICAL BRIDGE AUDIT
============================================================
READ-ONLY
NO FILE MODIFICATIONS
NO BACKEND MODIFICATIONS
NO DESTRUCTIVE CHANGES

OBJECTIVE:

CURRENT UI
    ↓
FRONTEND FUNCTIONS
    ↓
API CALLS
    ↓
CANONICAL BACKEND
    ↓
REAL RIDE LIFECYCLE
============================================================
`);

function walk(dir) {

    if (!fs.existsSync(dir)) {
        return [];
    }

    const results = [];

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
                [
                    'node_modules',
                    'dist',
                    '.git',
                    '_audit_backups'
                ].includes(entry.name)
            ) {
                continue;
            }

            results.push(
                ...walk(full)
            );

        } else if (
            entry.isFile() &&
            (
                entry.name.endsWith('.js') ||
                entry.name.endsWith('.html')
            )
        ) {

            results.push(full);

        }

    }

    return results;

}

function read(file) {

    try {

        return fs.readFileSync(
            file,
            'utf8'
        );

    } catch {

        return '';

    }

}

function rel(file) {

    return path.relative(
        ROOT,
        file
    );

}

const frontendRoot =
    path.join(
        ROOT,
        'frontend'
    );

const files =
    walk(frontendRoot);

console.log(`
============================================================
1. FRONTEND FILE INVENTORY
============================================================
`);

console.log(
    'FRONTEND SOURCE FILES:',
    files.length
);

files
    .map(rel)
    .sort()
    .forEach(
        file =>
            console.log(
                file
            )
    );


/* ============================================================
   2. API REFERENCES
============================================================ */

console.log(`
============================================================
2. ALL CANONICAL API REFERENCES
============================================================
`);

const apiRegex =
    /["'`](\/api\/[^"'`\\\s]*)["'`]/g;

const apiMap = {};

for (const file of files) {

    const text =
        read(file);

    let match;

    while (
        (match = apiRegex.exec(text))
    ) {

        const route =
            match[1];

        if (!apiMap[route]) {

            apiMap[route] = [];

        }

        apiMap[route].push(
            rel(file)
        );

    }

}

for (
    const route
    of Object.keys(apiMap).sort()
) {

    console.log(`
ROUTE:
${route}
FILES:
`);

    [
        ...new Set(
            apiMap[route]
        )
    ]
    .sort()
    .forEach(
        file =>
            console.log(
                '  ',
                file
            )
    );

}


/* ============================================================
   3. FETCH / HTTP CALL MAP
============================================================ */

console.log(`
============================================================
3. FRONTEND HTTP CALLS
============================================================
`);

const httpRegex =
    /(fetch|axios\.(get|post|patch|put|delete)|api\.(get|post|patch|put|delete))\s*\(/g;

let httpCalls = [];

for (const file of files) {

    const text =
        read(file);

    let match;

    while (
        (match = httpRegex.exec(text))
    ) {

        const start =
            Math.max(
                0,
                match.index - 180
            );

        const end =
            Math.min(
                text.length,
                match.index + 500
            );

        const context =
            text
                .slice(
                    start,
                    end
                )
                .replace(
                    /\s+/g,
                    ' '
                );

        httpCalls.push({

            file:
                rel(file),

            type:
                match[0],

            context

        });

    }

}

for (
    const call
    of httpCalls
) {

    console.log(`
FILE:
${call.file}

CALL:
${call.type}

CONTEXT:
${call.context}
`);

}


/* ============================================================
   4. RIDE REQUEST UI
============================================================ */

console.log(`
============================================================
4. PASSENGER RIDE REQUEST UI
============================================================
`);

const passengerKeywords = [

    'requestRide',
    'bookRide',
    'createRide',
    'submitRide',
    'rideService',
    'rideController',
    'pickup',
    'dropoff',
    'destination',
    'fare',
    'book',

];

for (const file of files) {

    const text =
        read(file);

    const found =
        passengerKeywords.filter(
            keyword =>
                text.includes(
                    keyword
                )
        );

    if (
        found.length
    ) {

        console.log(`
FILE:
${rel(file)}

KEYWORDS:
${found.join(', ')}
`);

    }

}


/* ============================================================
   5. DRIVER UI
============================================================ */

console.log(`
============================================================
5. DRIVER UI
============================================================
`);

const driverKeywords = [

    'driver',
    'acceptRide',
    'accept',
    'online',
    'offline',
    'arrived',
    'picked',
    'started',
    'complete',
    'dispatch',
    'pollForRideRequests'

];

for (const file of files) {

    const text =
        read(file);

    const found =
        driverKeywords.filter(
            keyword =>
                text.toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    )
        );

    if (
        found.length
    ) {

        console.log(`
FILE:
${rel(file)}

KEYWORDS:
${found.join(', ')}
`);

    }

}


/* ============================================================
   6. LIFECYCLE STATE REFERENCES
============================================================ */

console.log(`
============================================================
6. RIDE LIFECYCLE STATE REFERENCES
============================================================
`);

const lifecycleStates = [

    'REQUESTED',
    'MATCHING',
    'DRIVER_ASSIGNED',
    'DRIVER_ARRIVED',
    'PICKED_UP',
    'STARTED',
    'COMPLETED',
    'CANCELLED'

];

for (const state of lifecycleStates) {

    const matches = [];

    for (const file of files) {

        const text =
            read(file);

        if (
            text.includes(state)
        ) {

            matches.push(
                rel(file)
            );

        }

    }

    console.log(`
${state}:

${matches.length
    ? matches.join('\n')
    : 'NOT FOUND'}
`);

}


/* ============================================================
   7. BUTTON / EVENT HANDLER INVENTORY
============================================================ */

console.log(`
============================================================
7. UI BUTTONS AND EVENT HANDLERS
============================================================
`);

const handlerRegex =
    /(onclick\s*=\s*["'][^"']+["']|addEventListener\s*\(\s*["'][^"']+["']|function\s+[A-Za-z0-9_$]+\s*\()/g;

for (const file of files) {

    const text =
        read(file);

    let match;

    const handlers = [];

    while (
        (match = handlerRegex.exec(text))
    ) {

        handlers.push(
            match[0]
        );

    }

    if (
        handlers.length
    ) {

        console.log(`
FILE:
${rel(file)}

HANDLERS:
`);

        [
            ...new Set(
                handlers
            )
        ]
        .slice(
            0,
            100
        )
        .forEach(
            handler =>
                console.log(
                    '  ',
                    handler
                )
        );

    }

}


/* ============================================================
   8. DRIVER ACCEPTANCE PATH
============================================================ */

console.log(`
============================================================
8. DRIVER ACCEPTANCE PATH ANALYSIS
============================================================
`);

const acceptanceTerms = [

    '/api/rides/',
    '/accept',
    'acceptRide',
    'accept',
    'DRIVER_ASSIGNED'

];

for (const file of files) {

    const text =
        read(file);

    const found =
        acceptanceTerms.filter(
            term =>
                text.includes(
                    term
                )
        );

    if (
        found.length
    ) {

        console.log(`
FILE:
${rel(file)}

MATCHES:
${found.join(', ')}
`);

    }

}


/* ============================================================
   9. COMPLETION + REWARD PATH
============================================================ */

console.log(`
============================================================
9. COMPLETION + REWARD PATH
============================================================
`);

const completionTerms = [

    '/api/ride/complete',
    '/api/rewards',
    'completeRide',
    'completion',
    'reward',
    'THB_REWARD',
    'ALREADY_REWARDED'

];

for (const file of files) {

    const text =
        read(file);

    const found =
        completionTerms.filter(
            term =>
                text.includes(
                    term
                )
        );

    if (
        found.length
    ) {

        console.log(`
FILE:
${rel(file)}

MATCHES:
${found.join(', ')}
`);

    }

}


/* ============================================================
   10. POSSIBLE DUPLICATE RIDE SYSTEMS
============================================================ */

console.log(`
============================================================
10. POSSIBLE DUPLICATE / LEGACY RIDE SYSTEMS
============================================================
`);

const rideFiles =
    files.filter(
        file => {

            const name =
                path.basename(
                    file
                ).toLowerCase();

            return (
                name.includes('ride') ||
                name.includes('driver') ||
                name.includes('dispatch') ||
                name.includes('booking')
            );

        }
    );

rideFiles
    .map(rel)
    .sort()
    .forEach(
        file =>
            console.log(
                file
            )
    );


/* ============================================================
   11. FRONTEND ENTRYPOINT SCRIPT ORDER
============================================================ */

console.log(`
============================================================
11. FRONTEND SCRIPT ORDER
============================================================
`);

const entrypoints = [

    'frontend/index.html',
    'index.html'

];

for (
    const entry
    of entrypoints
) {

    const file =
        path.join(
            ROOT,
            entry
        );

    if (
        !fs.existsSync(file)
    ) {

        continue;

    }

    const text =
        read(file);

    console.log(`
ENTRYPOINT:
${entry}
`);

    const scriptRegex =
        /<script[^>]+src=["']([^"']+)["']/gi;

    let match;

    while (
        (match =
            scriptRegex.exec(text))
    ) {

        console.log(
            match[1]
        );

    }

}


/* ============================================================
   12. SUMMARY
============================================================ */

console.log(`
============================================================
O.8.54 SUMMARY
============================================================
`);

console.log(
    'FRONTEND FILES:',
    files.length
);

console.log(
    'UNIQUE API REFERENCES:',
    Object.keys(apiMap).length
);

console.log(
    'HTTP CALL SITES:',
    httpCalls.length
);

console.log(
    'RIDE-RELATED FILES:',
    rideFiles.length
);

console.log(`
AUDIT STATUS:

READ-ONLY:
YES

BACKEND MODIFIED:
NO

FRONTEND MODIFIED:
NO

DATABASE MODIFIED:
NO

NEXT STEP:

Use this output to identify:

1. ACTIVE PASSENGER UI
2. ACTIVE DRIVER UI
3. REAL CANONICAL API BRIDGE
4. LEGACY / DUPLICATE RIDE PATHS
5. MISSING UI ACTIONS
6. FINAL UI INTEGRATION PLAN

THEN:

O.8.55 — MINIMAL CANONICAL UI BRIDGE

NO BACKEND REPLACEMENT.
NO SECOND RIDE ENGINE.
NO DESTRUCTIVE REWRITE.

============================================================
O.8.54 COMPLETE
============================================================
`);

