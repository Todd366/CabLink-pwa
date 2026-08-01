const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

console.log(`
============================================================
CABLINK — RUNTIME TRUTH TRACE
============================================================
PURPOSE:
Identify the actual frontend -> API -> backend -> ride engine
-> repository -> reward path used by the current application.

Archives and backups are excluded from the active-runtime analysis.
============================================================
`);

function exists(file) {
    return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) return "";
    try {
        return fs.readFileSync(full, "utf8");
    } catch (e) {
        return "";
    }
}

function getFiles(dir, output = []) {

    const full = path.join(ROOT, dir);

    if (!fs.existsSync(full)) {
        return output;
    }

    for (const entry of fs.readdirSync(full, {
        withFileTypes: true
    })) {

        if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "archive" ||
            entry.name === "backups" ||
            entry.name === ".cablink_backups" ||
            entry.name === "migration_backup"
        ) {
            continue;
        }

        const relative = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            getFiles(relative, output);
        } else if (
            entry.name.endsWith(".js") ||
            entry.name.endsWith(".html") ||
            entry.name.endsWith(".json")
        ) {
            output.push(relative);
        }
    }

    return output;
}

const allFiles = getFiles(".");

const jsFiles = allFiles.filter(
    f => f.endsWith(".js")
);

const htmlFiles = allFiles.filter(
    f => f.endsWith(".html")
);

const routeFiles = allFiles.filter(
    f =>
        f.startsWith("backend/routes/") &&
        f.endsWith(".js")
);

const serviceFiles = allFiles.filter(
    f =>
        f.startsWith("backend/services/") &&
        f.endsWith(".js")
);

const frontendJs = allFiles.filter(
    f =>
        f.startsWith("frontend/") &&
        f.endsWith(".js")
);

function section(title) {
    console.log(`
============================================================
${title}
============================================================
`);
}

/*
============================================================
1. PACKAGE / STARTUP
============================================================
*/

section("1. PACKAGE / STARTUP");

if (exists("package.json")) {

    try {

        const pkg = JSON.parse(
            read("package.json")
        );

        console.log(
            JSON.stringify({
                name: pkg.name,
                scripts: pkg.scripts
            }, null, 2)
        );

    } catch (e) {

        console.log(
            "PACKAGE.JSON ERROR:",
            e.message
        );

    }

} else {

    console.log(
        "package.json NOT FOUND"
    );

}


/*
============================================================
2. FRONTEND ENTRY POINTS
============================================================
*/

section("2. FRONTEND ENTRY POINTS");

const frontendCandidates = [
    "index.html",
    "frontend/index.html",
    "frontend/dist/index.html",
    "dist/index.html"
];

for (const file of frontendCandidates) {

    if (exists(file)) {

        console.log(
            "[FOUND]",
            file
        );

        const text = read(file);

        const scripts = [
            ...text.matchAll(
                /<script[^>]+src=["']([^"']+)["']/gi
            )
        ].map(
            x => x[1]
        );

        if (scripts.length) {

            console.log(
                "  SCRIPT REFERENCES:"
            );

            scripts.forEach(
                s =>
                    console.log(
                        "   ->",
                        s
                    )
            );

        }

        const modules = [
            ...text.matchAll(
                /<script[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi
            )
        ];

        if (modules.length) {

            console.log(
                "  INLINE MODULES:",
                modules.length
            );

        }

    } else {

        console.log(
            "[MISSING]",
            file
        );

    }

}


/*
============================================================
3. BACKEND ENTRY POINTS
============================================================
*/

section("3. BACKEND ENTRY POINTS");

const backendCandidates = [
    "backend/server.js",
    "backend/server/app.js",
    "server.js",
    "api/index.js"
];

for (const file of backendCandidates) {

    if (exists(file)) {

        console.log(
            "[FOUND]",
            file
        );

        const text = read(file);

        const requires = [
            ...text.matchAll(
                /require\(["']([^"']+)["']\)/g
            )
        ].map(
            x => x[1]
        );

        console.log(
            "  IMPORTS:"
        );

        requires
            .filter(
                x =>
                    /route|ride|canonical|server|app|reward|repository/i
                        .test(x)
            )
            .forEach(
                x =>
                    console.log(
                        "   ->",
                        x
                    )
            );

    } else {

        console.log(
            "[MISSING]",
            file
        );

    }

}


/*
============================================================
4. REGISTERED ROUTES
============================================================
*/

section("4. REGISTERED ROUTES");

for (const file of routeFiles) {

    const text = read(file);

    const lines = text.split("\n");

    let found = false;

    lines.forEach(
        (line, index) => {

            if (
                /router\.(get|post|patch|put|delete)|app\.(get|post|patch|put|delete)/i
                    .test(line)
            ) {

                if (!found) {

                    console.log(
                        `\n${file}`
                    );

                    found = true;

                }

                console.log(
                    `  ${index + 1}:`,
                    line.trim()
                );

            }

        }
    );

}


/*
============================================================
5. CANONICAL RIDE ENGINE
============================================================
*/

section("5. CANONICAL RIDE ENGINE");

const canonicalEngine =
    "backend/canonical/ride_engine.js";

const canonicalRepository =
    "backend/canonical/ride_repository.js";

console.log(
    exists(canonicalEngine)
        ? "[FOUND] " + canonicalEngine
        : "[MISSING] " + canonicalEngine
);

console.log(
    exists(canonicalRepository)
        ? "[FOUND] " + canonicalRepository
        : "[MISSING] " + canonicalRepository
);

if (exists(canonicalEngine)) {

    const text = read(
        canonicalEngine
    );

    console.log(
        "\nENGINE IMPORTS:"
    );

    [
        ...text.matchAll(
            /require\(["']([^"']+)["']\)/g
        )
    ]
    .map(
        x => x[1]
    )
    .forEach(
        x =>
            console.log(
                " ->",
                x
            )
    );

    console.log(
        "\nENGINE TRANSITIONS:"
    );

    text.split("\n")
        .forEach(
            (line, index) => {

                if (
                    /transition|createRide|create\(|update\(|findById|getRide/i
                        .test(line)
                ) {

                    console.log(
                        `${index + 1}:`,
                        line.trim()
                    );

                }

            }
        );

}


/*
============================================================
6. REPOSITORY PATHS
============================================================
*/

section("6. REPOSITORY PATHS");

const repositoryCandidates = [
    "backend/canonical/ride_repository.js",
    "backend/database/ride_repository.js"
];

for (const file of repositoryCandidates) {

    if (exists(file)) {

        console.log(
            "\n[FOUND]",
            file
        );

        const text = read(file);

        text.split("\n")
            .forEach(
                (line, index) => {

                    if (
                        /FILE|JSON|firebase|firestore|writeFile|readFile|create|update|find|get/i
                            .test(line)
                    ) {

                        console.log(
                            `${index + 1}:`,
                            line.trim()
                        );

                    }

                }
            );

    } else {

        console.log(
            "[MISSING]",
            file
        );

    }

}


/*
============================================================
7. FRONTEND API CALLS
============================================================
*/

section("7. FRONTEND API CALLS");

let apiCount = 0;

for (const file of frontendJs) {

    const text = read(file);

    text.split("\n")
        .forEach(
            (line, index) => {

                if (
                    /fetch\s*\(|axios|\/api\//i
                        .test(line)
                ) {

                    apiCount++;

                    console.log(
                        `${file}:${index + 1}`,
                        line.trim()
                    );

                }

            }
        );

}

console.log(
    "\nTOTAL FRONTEND API REFERENCES:",
    apiCount
);


/*
============================================================
8. RIDE FRONTEND CONTROL PATH
============================================================
*/

section("8. RIDE FRONTEND CONTROL PATH");

const rideFrontendKeywords = [
    "book",
    "ride",
    "driver",
    "accept",
    "arrived",
    "pickup",
    "picked",
    "start",
    "complete",
    "reward"
];

for (const file of frontendJs) {

    const text = read(file);

    const matches =
        rideFrontendKeywords.filter(
            keyword =>
                new RegExp(
                    keyword,
                    "i"
                ).test(text)
        );

    if (matches.length) {

        console.log(
            file,
            "=>",
            matches.join(", ")
        );

    }

}


/*
============================================================
9. DRIVER LIFECYCLE
============================================================
*/

section("9. DRIVER LIFECYCLE");

const lifecycleFiles =
    frontendJs.filter(
        f =>
            /driver|lifecycle|dispatch/i
                .test(f)
    );

for (const file of lifecycleFiles) {

    console.log(
        "\nFILE:",
        file
    );

    read(file)
        .split("\n")
        .forEach(
            (line, index) => {

                if (
                    /ONLINE|OFFLINE|ACCEPT|ARRIVED|PICKED|STARTED|COMPLETED|fetch|\/api\//i
                        .test(line)
                ) {

                    console.log(
                        `${index + 1}:`,
                        line.trim()
                    );

                }

            }
        );

}


/*
============================================================
10. REWARD PATH
============================================================
*/

section("10. REWARD PATH");

const rewardFiles =
    allFiles.filter(
        f =>
            /reward|economy|wallet|thb/i
                .test(f) &&
            !/archive|backup|migration/i
                .test(f)
    );

rewardFiles.forEach(
    file =>
        console.log(
            file
        )
);


/*
============================================================
11. ACTIVE RIDE AUTHORITY IMPORTS
============================================================
*/

section("11. ACTIVE RIDE AUTHORITY IMPORTS");

const activeFiles =
    [
        ...routeFiles,
        ...serviceFiles,
        ...frontendJs,
        "backend/server.js",
        "backend/server/app.js"
    ];

for (const file of activeFiles) {

    if (!exists(file)) continue;

    const text = read(file);

    const lines = text.split("\n");

    lines.forEach(
        (line, index) => {

            if (
                /ride_engine|ride_repository|live_ride_service|live_rides|canonical/i
                    .test(line)
            ) {

                console.log(
                    `${file}:${index + 1}`,
                    line.trim()
                );

            }

        }
    );

}


/*
============================================================
12. FINAL RUNTIME TRUTH SUMMARY
============================================================
*/

section("12. FINAL RUNTIME TRUTH SUMMARY");

console.log(
    "JS FILES SCANNED:",
    jsFiles.length
);

console.log(
    "HTML FILES SCANNED:",
    htmlFiles.length
);

console.log(
    "FRONTEND JS FILES:",
    frontendJs.length
);

console.log(
    "BACKEND ROUTES:",
    routeFiles.length
);

console.log(
    "BACKEND SERVICES:",
    serviceFiles.length
);

console.log(
    "FRONTEND API REFERENCES:",
    apiCount
);

console.log(`
NEXT DECISION:

1. Identify the actual frontend entry point.
2. Identify the actual backend startup entry point.
3. Identify the active ride API.
4. Identify the active ride engine.
5. Identify the active repository.
6. Identify any live_ride path still reachable.
7. Identify the active reward completion path.

Do not delete anything.

============================================================
RUNTIME TRUTH TRACE COMPLETE
============================================================
`);

