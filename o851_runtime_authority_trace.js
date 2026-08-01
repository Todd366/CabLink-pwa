const fs = require("fs");
const path = require("path");

console.log(`
==============================================
CABLINK O.8.51 — RUNTIME AUTHORITY TRACE
==============================================
`);

const ROOT = process.cwd();

const runtimeRoots = [
    "backend/server",
    "backend/routes",
    "backend/services",
    "backend/canonical",
    "backend/database",
    "backend/rewards"
];

const explicitFiles = [
    "backend/ride_store.js",
    "backend/server.js"
];

const ignoredSegments = [
    "archive",
    "backups",
    "migration_backup",
    ".cablink_backups"
];

function isIgnored(file) {
    return ignoredSegments.some(
        segment =>
            file.split(path.sep).includes(segment)
    );
}

function getFiles(dir) {

    const full = path.join(ROOT, dir);

    if (!fs.existsSync(full)) {
        return [];
    }

    return fs.readdirSync(
        full,
        { withFileTypes: true }
    ).flatMap(entry => {

        const relative =
            path.join(
                dir,
                entry.name
            );

        if (entry.isDirectory()) {
            return getFiles(relative);
        }

        if (
            path.extname(entry.name) === ".js" &&
            !isIgnored(relative)
        ) {
            return [relative];
        }

        return [];

    });

}

const files = [
    ...new Set([
        ...runtimeRoots.flatMap(getFiles),
        ...explicitFiles.filter(
            file =>
                fs.existsSync(
                    path.join(ROOT, file)
                )
        )
    ])
];

console.log(
    "RUNTIME FILES SCANNED:",
    files.length
);

const records = [];

function record(
    file,
    line,
    category,
    code
) {

    records.push({
        file,
        line,
        category,
        code
    });

}

const patterns = [

    {
        category: "CANONICAL ENGINE IMPORT",
        regex: /require\s*\(\s*["'][^"']*canonical\/ride_engine["']\s*\)/g
    },

    {
        category: "CANONICAL ENGINE USE",
        regex: /engine\.(createRide|transition|getRide|findRide|updateRide)\s*\(/g
    },

    {
        category: "CANONICAL REPOSITORY IMPORT",
        regex: /require\s*\(\s*["'][^"']*canonical\/ride_repository["']\s*\)/g
    },

    {
        category: "CANONICAL REPOSITORY USE",
        regex: /repository\.(create|update|findById|get|find)\s*\(/g
    },

    {
        category: "SECONDARY DATABASE REPOSITORY IMPORT",
        regex: /require\s*\(\s*["'][^"']*database\/ride[_Rr]epository["']\s*\)/g
    },

    {
        category: "RIDE STORE IMPORT",
        regex: /require\s*\(\s*["'][^"']*ride_store["']\s*\)/g
    },

    {
        category: "LEGACY LIVE RIDE IMPORT",
        regex: /require\s*\(\s*["'][^"']*live_ride_service["']\s*\)/g
    },

    {
        category: "LIVE RIDE FILE",
        regex: /live_rides\.json/g
    },

    {
        category: "DIRECT RIDE JSON WRITE",
        regex: /fs\.writeFileSync\s*\(/g
    },

    {
        category: "RIDE STATUS MUTATION",
        regex: /\b(ride|r|request)\.status\s*=\s*["'`][A-Z_]+["'`]/g
    },

    {
        category: "RIDE OBJECT MUTATION",
        regex: /\b(ride|r)\.(driverId|driverName|completedAt|acceptedAt)\s*=/g
    },

    {
        category: "RIDE ROUTE MOUNT",
        regex: /app\.use\s*\(\s*["'][^"']*rides?[^"']*["']\s*,/g
    },

    {
        category: "LIVE RIDE ROUTE MOUNT",
        regex: /app\.use\s*\(\s*["'][^"']*["']\s*,\s*liveRideRoutes?\s*\)/g
    },

    {
        category: "COMPLETION ROUTE MOUNT",
        regex: /app\.use\s*\(\s*["'][^"']*["']\s*,\s*completionRoutes?\s*\)/g
    },

    {
        category: "RIDE COMPLETION CALL",
        regex: /completion\.completeRide\s*\(/g
    },

    {
        category: "CANONICAL TRANSITION CALL",
        regex: /engine\.transition\s*\(/g
    }

];

for (const file of files) {

    const full =
        path.join(ROOT, file);

    const text =
        fs.readFileSync(
            full,
            "utf8"
        );

    const lines =
        text.split("\n");

    lines.forEach(
        (line, index) => {

            for (const pattern of patterns) {

                pattern.regex.lastIndex = 0;

                if (
                    pattern.regex.test(line)
                ) {

                    record(
                        file,
                        index + 1,
                        pattern.category,
                        line.trim()
                    );

                }

            }

        }
    );

}

function printSection(
    title,
    categories
) {

    console.log(`
==============================================
${title}
==============================================
`);

    const matches =
        records.filter(
            r =>
                categories.includes(
                    r.category
                )
        );

    if (!matches.length) {

        console.log(
            "NONE DETECTED"
        );

        return;

    }

    matches.forEach(
        r =>
            console.log(
                `${r.file}:${r.line}`,
                `[${r.category}]`,
                r.code
            )
    );

}

printSection(
    "1. CANONICAL ENGINE PATH",
    [
        "CANONICAL ENGINE IMPORT",
        "CANONICAL ENGINE USE",
        "CANONICAL TRANSITION CALL"
    ]
);

printSection(
    "2. CANONICAL REPOSITORY PATH",
    [
        "CANONICAL REPOSITORY IMPORT",
        "CANONICAL REPOSITORY USE"
    ]
);

printSection(
    "3. SECONDARY DATABASE REPOSITORY",
    [
        "SECONDARY DATABASE REPOSITORY IMPORT"
    ]
);

printSection(
    "4. LEGACY LIVE RIDE PATH",
    [
        "LEGACY LIVE RIDE IMPORT",
        "LIVE RIDE FILE"
    ]
);

printSection(
    "5. RIDE STORE PATH",
    [
        "RIDE STORE IMPORT"
    ]
);

printSection(
    "6. DIRECT STORAGE WRITES",
    [
        "DIRECT RIDE JSON WRITE"
    ]
);

printSection(
    "7. DIRECT RIDE STATE MUTATIONS",
    [
        "RIDE STATUS MUTATION",
        "RIDE OBJECT MUTATION"
    ]
);

printSection(
    "8. ACTIVE ROUTE MOUNTS",
    [
        "RIDE ROUTE MOUNT",
        "LIVE RIDE ROUTE MOUNT",
        "COMPLETION ROUTE MOUNT"
    ]
);

printSection(
    "9. COMPLETION PATH",
    [
        "RIDE COMPLETION CALL",
        "CANONICAL TRANSITION CALL"
    ]
);

console.log(`
==============================================
O.8.51 AUTHORITY CLASSIFICATION
==============================================
`);

const hasCanonicalEngine =
    records.some(
        r =>
            r.category ===
            "CANONICAL ENGINE IMPORT"
    );

const hasCanonicalTransition =
    records.some(
        r =>
            r.category ===
            "CANONICAL TRANSITION CALL"
    );

const secondaryRepositoryFiles =
    [
        ...new Set(
            records
                .filter(
                    r =>
                        r.category ===
                        "SECONDARY DATABASE REPOSITORY IMPORT"
                )
                .map(
                    r => r.file
                )
        )
    ];

const legacyFiles =
    [
        ...new Set(
            records
                .filter(
                    r =>
                        r.category ===
                            "LEGACY LIVE RIDE IMPORT" ||
                        r.category ===
                            "LIVE RIDE FILE"
                )
                .map(
                    r => r.file
                )
        )
    ];

const directMutationFiles =
    [
        ...new Set(
            records
                .filter(
                    r =>
                        r.category ===
                            "RIDE STATUS MUTATION" ||
                        r.category ===
                            "RIDE OBJECT MUTATION"
                )
                .map(
                    r => r.file
                )
        )
    ];

const directWriteFiles =
    [
        ...new Set(
            records
                .filter(
                    r =>
                        r.category ===
                        "DIRECT RIDE JSON WRITE"
                )
                .map(
                    r => r.file
                )
        )
    ];

console.log(
    "CANONICAL ENGINE DETECTED:",
    hasCanonicalEngine
);

console.log(
    "CANONICAL TRANSITION DETECTED:",
    hasCanonicalTransition
);

console.log(
    "SECONDARY REPOSITORY FILES:",
    secondaryRepositoryFiles.length
);

console.log(
    "LEGACY LIVE RIDE FILES:",
    legacyFiles.length
);

console.log(
    "DIRECT RIDE MUTATION FILES:",
    directMutationFiles.length
);

console.log(
    "DIRECT STORAGE WRITE FILES:",
    directWriteFiles.length
);

console.log(`
==============================================
O.8.51 RUNTIME VERDICT
==============================================
`);

if (
    hasCanonicalEngine &&
    hasCanonicalTransition &&
    secondaryRepositoryFiles.length === 0 &&
    legacyFiles.length === 0 &&
    directMutationFiles.length === 0
) {

    console.log(`
PASS

RUNTIME RIDE AUTHORITY:
CANONICAL

SECONDARY REPOSITORY:
NONE DETECTED

LEGACY LIVE RIDE:
NONE DETECTED

DIRECT RIDE MUTATIONS:
NONE DETECTED

NEXT:
PROCEED TO END-TO-END RUNTIME VERIFICATION
`);

} else {

    console.log(`
AUDIT REQUIRED

The active runtime still contains
one or more competing or ambiguous
ride authority paths.

IMPORTANT:
These findings are runtime-scoped only.

Archives and backups were intentionally excluded.

NEXT:
TRACE ONLY THE ACTIVE FILES IDENTIFIED ABOVE.

DO NOT DELETE ANYTHING YET.
`);

}

console.log(`
==============================================
O.8.51 COMPLETE
==============================================
`);
