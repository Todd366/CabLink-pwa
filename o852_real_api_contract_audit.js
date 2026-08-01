'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = process.cwd();
const HOST = '127.0.0.1';
const PORT = 3000;

console.log(`
============================================================
CABLINK O.8.52 — REAL API CONTRACT AUDIT
============================================================
NO DESTRUCTIVE CHANGES
REAL BACKEND
REAL ROUTES
REAL FRONTEND REFERENCES
============================================================
`);

function walk(dir) {

    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(
        dir,
        { withFileTypes: true }
    ).flatMap(entry => {

        const full =
            path.join(
                dir,
                entry.name
            );

        if (entry.isDirectory()) {
            return walk(full);
        }

        if (
            entry.isFile() &&
            (
                entry.name.endsWith('.js') ||
                entry.name.endsWith('.html')
            )
        ) {
            return [full];
        }

        return [];

    });

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

function normaliseRoute(route) {

    return route
        .replace(/["'`]/g, '')
        .replace(/\$\{[^}]+\}/g, ':id')
        .replace(/\/+$/, '') || '/';

}

function extractFrontendRoutes() {

    const frontend =
        path.join(
            ROOT,
            'frontend'
        );

    const files =
        walk(frontend);

    const routes = [];

    const regex =
        /["'`](\/api\/[^"'`\\\s]*)["'`]/g;

    for (const file of files) {

        const text =
            read(file);

        let match;

        while (
            (match = regex.exec(text))
        ) {

            routes.push({

                file:
                    path.relative(
                        ROOT,
                        file
                    ),

                route:
                    normaliseRoute(
                        match[1]
                    )

            });

        }

    }

    return routes;

}

function extractBackendRoutes() {

    const backend =
        path.join(
            ROOT,
            'backend'
        );

    const files =
        walk(backend);

    const routes = [];

    const routeRegex =
        /app\.(get|post|patch|put|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g;

    const routerRegex =
        /router\.(get|post|patch|put|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g;

    for (const file of files) {

        const text =
            read(file);

        let match;

        while (
            (match = routeRegex.exec(text))
        ) {

            routes.push({

                file:
                    path.relative(
                        ROOT,
                        file
                    ),

                method:
                    match[1].toUpperCase(),

                route:
                    normaliseRoute(
                        match[2]
                    )

            });

        }

        while (
            (match = routerRegex.exec(text))
        ) {

            routes.push({

                file:
                    path.relative(
                        ROOT,
                        file
                    ),

                method:
                    match[1].toUpperCase(),

                route:
                    normaliseRoute(
                        match[2]
                    )

            });

        }

    }

    return routes;

}

const frontendRoutes =
    extractFrontendRoutes();

const backendRoutes =
    extractBackendRoutes();

const frontendUnique =
    [
        ...new Set(
            frontendRoutes.map(
                x => x.route
            )
        )
    ].sort();

const backendUnique =
    [
        ...new Set(
            backendRoutes.map(
                x => x.route
            )
        )
    ].sort();

console.log(`
============================================================
1. ROUTE COUNTS
============================================================
`);

console.log(
    'FRONTEND API REFERENCES:',
    frontendUnique.length
);

console.log(
    'BACKEND ROUTE DEFINITIONS:',
    backendUnique.length
);

console.log(`
============================================================
2. FRONTEND → BACKEND MISSING ROUTES
============================================================
`);

const missing =
    frontendUnique.filter(
        route =>
            !backendUnique.some(
                backendRoute =>
                    backendRoute === route ||
                    backendRoute.includes(':id') &&
                    route.startsWith(
                        backendRoute.split(':id')[0]
                    ) ||
                    route.includes(':id') &&
                    backendRoute.startsWith(
                        route.split(':id')[0]
                    )
            )
    );

if (
    missing.length === 0
) {

    console.log(
        'NONE DETECTED'
    );

} else {

    missing.forEach(
        route =>
            console.log(
                'MISSING:',
                route
            )
    );

}

console.log(`
============================================================
3. BACKEND ROUTES WITH FRONTEND REFERENCES
============================================================
`);

const connected =
    backendRoutes.filter(
        backend =>
            frontendUnique.some(
                frontend =>
                    frontend === backend.route ||
                    frontend.includes(':id') &&
                    backend.route.startsWith(
                        frontend.split(':id')[0]
                    ) ||
                    backend.route.includes(':id') &&
                    frontend.startsWith(
                        backend.route.split(':id')[0]
                    )
            )
    );

const connectedUnique =
    [
        ...new Set(
            connected.map(
                x =>
                    `${x.method} ${x.route}`
            )
        )
    ];

connectedUnique
    .sort()
    .forEach(
        x =>
            console.log(
                'CONNECTED:',
                x
            )
    );

console.log(`
============================================================
4. CRITICAL CABLINK CONTRACTS
============================================================
`);

const critical = [

    '/api/rides',

    '/api/rides/:id',

    '/api/rides/:id/accept',

    '/api/drivers/online',

    '/api/drivers/offline',

    '/api/drivers/apply',

    '/api/drivers/applications',

    '/api/rewards/ride/:rideId',

    '/api/ride/complete',

    '/api/ecosystem-intelligence'

];

for (
    const route
    of critical
) {

    const found =
        backendRoutes.filter(
            x => {

                const actual =
                    x.route;

                if (
                    actual === route
                ) {
                    return true;
                }

                if (
                    route.includes(':id')
                ) {

                    return actual ===
                        route.replace(
                            ':id',
                            ':param'
                        );

                }

                if (
                    route.includes(':rideId')
                ) {

                    return actual ===
                        route.replace(
                            ':rideId',
                            ':param'
                        );

                }

                return false;

            }
        );

    console.log(
        found.length
            ? 'PRESENT:'
            : 'MISSING:',
        route,
        found.map(
            x =>
                x.method
        ).join(',')
    );

}

console.log(`
============================================================
5. FRONTEND FILES USING CRITICAL RIDE API
============================================================
`);

const criticalFrontend =
    frontendRoutes.filter(
        x =>
            x.route.startsWith(
                '/api/rides'
            ) ||
            x.route.startsWith(
                '/api/drivers'
            ) ||
            x.route.startsWith(
                '/api/rewards'
            ) ||
            x.route.includes(
                '/ride/'
            )
    );

[
    ...new Set(
        criticalFrontend.map(
            x => x.file
        )
    )
]
.sort()
.forEach(
    file =>
        console.log(
            file
        )
);

console.log(`
============================================================
O.8.52 RESULT
============================================================
`);

console.log(
    'FRONTEND ROUTES:',
    frontendUnique.length
);

console.log(
    'BACKEND ROUTES:',
    backendUnique.length
);

console.log(
    'MISSING CONTRACTS:',
    missing.length
);

if (
    missing.length === 0
) {

    console.log(`
CONTRACT STATUS:
CLEAN

NEXT:
RUN REAL END-TO-END RIDE TEST
`);

} else {

    console.log(`
CONTRACT STATUS:
INTEGRATION REQUIRED

IMPORTANT:
DO NOT REPLACE THE BACKEND.

NEXT:
CONNECT ONLY THE MISSING CONTRACTS
THAT ARE REQUIRED BY THE CURRENT UI.
`);

}

console.log(`
============================================================
O.8.52 COMPLETE
============================================================
`);

