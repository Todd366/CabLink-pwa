const fs = require("fs");
const path = require("path");

console.log(`
==============================================
CABLINK O.8.48 — CANONICAL STATE AUTHORITY AUDIT
==============================================
`);

const ROOT = process.cwd();

const scanDirs = [
    "backend/routes",
    "backend/services",
    "backend/canonical"
];

const extensions = [
    ".js"
];

const patterns = [

    {
        name: "CANONICAL ENGINE TRANSITION",
        regex: /engine\.transition\s*\(/g
    },

    {
        name: "CANONICAL ENGINE GET",
        regex: /engine\.getRide\s*\(/g
    },

    {
        name: "REPOSITORY UPDATE",
        regex: /repository\.update\s*\(/g
    },

    {
        name: "REPOSITORY CREATE",
        regex: /repository\.create\s*\(/g
    },

    {
        name: "DIRECT STATUS ASSIGNMENT",
        regex: /\.status\s*=/g
    },

    {
        name: "COMPLETED STATE",
        regex: /["']COMPLETED["']/g
    },

    {
        name: "LEGACY LIVE RIDE",
        regex: /live_ride_service|live_rides\.json/g
    },

    {
        name: "DIRECT JSON WRITE",
        regex: /fs\.writeFileSync\s*\(/g
    },

    {
        name: "DIRECT JSON READ",
        regex: /fs\.readFileSync\s*\(/g
    }

];


function getFiles(dir) {

    const full =
        path.join(
            ROOT,
            dir
        );

    if (
        !fs.existsSync(full)
    ) {
        return [];
    }

    return fs
        .readdirSync(
            full,
            {
                withFileTypes:
                    true
            }
        )
        .flatMap(
            entry => {

                const relative =
                    path.join(
                        dir,
                        entry.name
                    );

                if (
                    entry.isDirectory()
                ) {

                    return getFiles(
                        relative
                    );

                }

                if (
                    extensions.includes(
                        path.extname(
                            entry.name
                        )
                    )
                ) {

                    return [
                        relative
                    ];

                }

                return [];

            }
        );

}


const files =
    scanDirs.flatMap(
        getFiles
    );


let findings = [];


for (
    const file of files
) {

    const full =
        path.join(
            ROOT,
            file
        );

    const data =
        fs.readFileSync(
            full,
            "utf8"
        );

    const lines =
        data.split("\n");


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


console.log(`
FILES SCANNED:
${files.length}
`);


console.log(`
==============================================
CANONICAL ENGINE USAGE
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
            "CANONICAL ENGINE TRANSITION"
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
DIRECT REPOSITORY WRITES
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
            "REPOSITORY UPDATE" ||
            x.type ===
            "REPOSITORY CREATE"
    )
    .forEach(
        x =>
            console.log(
                `${x.file}:${x.line}`,
                x.type,
                x.code
            )
    );


console.log(`
==============================================
DIRECT STATUS MUTATIONS
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
            "DIRECT STATUS ASSIGNMENT"
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
LEGACY STATE WRITERS
==============================================
`);

const legacy =
    findings.filter(
        x =>
            x.type ===
                "LEGACY LIVE RIDE" ||
            x.type ===
                "DIRECT JSON WRITE"
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
                x.type,
                x.code
            )
    );

}


console.log(`
==============================================
COMPLETION WRITERS
==============================================
`);

findings
    .filter(
        x =>
            x.type ===
                "COMPLETED STATE"
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
O.8.48 AUDIT SUMMARY
==============================================
`);

const engineTransitions =
    findings.filter(
        x =>
            x.type ===
            "CANONICAL ENGINE TRANSITION"
    );

const directStatus =
    findings.filter(
        x =>
            x.type ===
            "DIRECT STATUS ASSIGNMENT"
    );

const legacyWriters =
    findings.filter(
        x =>
            x.type ===
                "LEGACY LIVE RIDE" ||
            x.type ===
                "DIRECT JSON WRITE"
    );


console.log(
    "CANONICAL TRANSITION CALLS:",
    engineTransitions.length
);

console.log(
    "DIRECT STATUS MUTATIONS:",
    directStatus.length
);

console.log(
    "LEGACY/DIRECT STORAGE WRITERS:",
    legacyWriters.length
);


if (
    engineTransitions.length > 0 &&
    directStatus.length === 0 &&
    legacyWriters.length === 0
) {

    console.log(`
RESULT:
PASS

STATE AUTHORITY:
CANONICAL

ALL MUTATIONS:
ROUTED THROUGH CANONICAL ENGINE

LEGACY WRITERS:
NONE DETECTED
`);

} else {

    console.log(`
RESULT:
AUDIT REQUIRED

STATE AUTHORITY:
NOT YET FULLY VERIFIED

REVIEW FINDINGS ABOVE
`);

}


console.log(`
==============================================
O.8.48 COMPLETE
==============================================
`);
