const fs = require("fs");
const path = require("path");

console.log(`
==============================================
CABLINK O.8.49 — CANONICAL WRITER CLASSIFICATION
==============================================
`);

const ROOT = process.cwd();

const targets = [
    "backend/routes",
    "backend/services",
    "backend/canonical"
];

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
            path.extname(entry.name) ===
            ".js"
        ) {
            return [relative];
        }

        return [];

    });

}

const files =
    targets.flatMap(getFiles);

const findings = [];

const patterns = [

    {
        name: "RIDE REPOSITORY",
        regex: /ride_repository|repository\.create|repository\.update|repository\.get|repository\.find/g
    },

    {
        name: "CANONICAL ENGINE",
        regex: /ride_engine|engine\.transition|engine\.create/g
    },

    {
        name: "LIVE RIDE LEGACY",
        regex: /live_ride_service|live_rides\.json/g
    },

    {
        name: "RIDE STATUS MUTATION",
        regex: /status\s*=\s*["'`][A-Z_]+["'`]/g
    },

    {
        name: "RIDE OBJECT MUTATION",
        regex: /\b(ride|r)\.(status|driverId|driverName|completedAt|acceptedAt)\s*=/g
    },

    {
        name: "JSON STORAGE WRITE",
        regex: /fs\.writeFileSync\s*\(/g
    },

    {
        name: "RIDE ROUTE",
        regex: /\/api\/rides|ride\/complete|rewards\/ride/g
    }

];

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

            for (
                const pattern
                of patterns
            ) {

                pattern.regex.lastIndex =
                    0;

                if (
                    pattern.regex.test(
                        line
                    )
                ) {

                    findings.push({

                        file,

                        line:
                            index + 1,

                        type:
                            pattern.name,

                        code:
                            line.trim()

                    });

                }

            }

        }
    );

}


console.log(
    "FILES SCANNED:",
    files.length
);


console.log(`
==============================================
A. CANONICAL ENGINE / REPOSITORY
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
                "CANONICAL ENGINE" ||
            x.type ===
                "RIDE REPOSITORY"
    )
    .forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                `[${x.type}]`,
                x.code
            )
    );


console.log(`
==============================================
B. LEGACY LIVE RIDE SYSTEM
==============================================
`);

const legacy =
    findings.filter(
        x =>
            x.type ===
            "LIVE RIDE LEGACY"
    );

if (
    legacy.length === 0
) {

    console.log(
        "NONE DETECTED"
    );

} else {

    legacy.forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                x.code
            )
    );

}


console.log(`
==============================================
C. RIDE-SPECIFIC DIRECT MUTATIONS
==============================================
`);

const directRideMutations =
    findings.filter(
        x =>
            x.type ===
                "RIDE STATUS MUTATION" ||
            x.type ===
                "RIDE OBJECT MUTATION"
    );

directRideMutations.forEach(
    x =>
        console.log(
            `${x.file}:${x.line}`,
            `[${x.type}]`,
            x.code
        )
);


console.log(`
==============================================
D. DIRECT STORAGE WRITES
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
            "JSON STORAGE WRITE"
    )
    .forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                x.code
            )
    );


console.log(`
==============================================
E. RIDE API SURFACE
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
            "RIDE ROUTE"
    )
    .forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                x.code
            )
    );


console.log(`
==============================================
O.8.49 CLASSIFICATION
==============================================
`);

const legacyFiles =
    [
        ...new Set(
            legacy.map(
                x => x.file
            )
        )
    ];

const canonicalFiles =
    [
        ...new Set(
            findings
                .filter(
                    x =>
                        x.type ===
                            "CANONICAL ENGINE" ||
                        x.type ===
                            "RIDE REPOSITORY"
                )
                .map(
                    x => x.file
                )
        )
    ];

const mutationFiles =
    [
        ...new Set(
            directRideMutations.map(
                x => x.file
            )
        )
    ];

console.log(
    "CANONICAL FILES:",
    canonicalFiles.length
);

console.log(
    "LEGACY FILES:",
    legacyFiles.length
);

console.log(
    "DIRECT RIDE MUTATION FILES:",
    mutationFiles.length
);


console.log(`
==============================================
O.8.49 RESULT
==============================================
`);

if (
    legacyFiles.length === 0 &&
    mutationFiles.length === 0
) {

    console.log(`
PASS

CANONICAL RIDE AUTHORITY:
CLEAN

LEGACY RIDE SYSTEM:
NOT DETECTED

DIRECT RIDE MUTATIONS:
NOT DETECTED
`);

} else {

    console.log(`
AUDIT REQUIRED

The canonical ride system must be isolated
from legacy or direct ride mutation paths.

Do NOT delete files yet.

Next action:
Trace each finding to determine whether
it is a real ride-state writer or an
independent subsystem writer.
`);

}


console.log(`
==============================================
O.8.49 COMPLETE
==============================================
`);

