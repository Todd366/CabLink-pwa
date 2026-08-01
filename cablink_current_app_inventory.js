const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const SKIP = new Set([
    "node_modules",
    ".git",
    ".cache",
    "dist"
]);

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(entry.name)) continue;

        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full, out);
        } else {
            out.push(path.relative(ROOT, full));
        }
    }

    return out;
}

function section(title) {
    console.log("\n============================================================");
    console.log(title);
    console.log("============================================================");
}

function exists(file) {
    return fs.existsSync(path.join(ROOT, file));
}

const allFiles = walk(ROOT);

const jsFiles = allFiles.filter(
    f => f.endsWith(".js")
);

const htmlFiles = allFiles.filter(
    f => f.endsWith(".html")
);

const jsonFiles = allFiles.filter(
    f => f.endsWith(".json")
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

const frontendFiles = allFiles.filter(
    f =>
        f.startsWith("frontend/")
);

const testFiles = jsFiles.filter(
    f =>
        /test|audit|check|survival|o8/i.test(
            path.basename(f)
        )
);

section("CABLINK — CURRENT APP INVENTORY");

console.log("PROJECT ROOT:");
console.log(ROOT);

section("1. IMPORTANT FILES");

const important = [
    "package.json",
    "index.html",
    "frontend/index.html",
    "frontend/js/app.js",
    "frontend/js/app_core.js",
    "frontend/js/core.js",
    "frontend/js/role.js",
    "frontend/js/fix.js",
    "frontend/js/fare_engine.js",
    "frontend/js/gps/location_engine.js",
    "backend/server.js",
    "backend/canonical/ride_engine.js",
    "backend/canonical/ride_repository.js",
    "backend/database/ride_repository.js",
    "backend/storage/cablink_db.json",
    "manifest.json",
    "sw.js",
    "vite.config.js"
];

for (const file of important) {
    console.log(
        (exists(file) ? "[FOUND]   " : "[MISSING] ") +
        file
    );
}

section("2. ALL JAVASCRIPT FILES");

for (const file of jsFiles.sort()) {
    console.log(file);
}

section("3. FRONTEND FILES");

for (const file of frontendFiles.sort()) {
    console.log(file);
}

section("4. BACKEND ROUTES");

for (const file of routeFiles.sort()) {
    console.log(file);
}

section("5. BACKEND SERVICES");

for (const file of serviceFiles.sort()) {
    console.log(file);
}

section("6. TEST / AUDIT FILES");

if (testFiles.length === 0) {
    console.log("NONE FOUND");
} else {
    for (const file of testFiles.sort()) {
        console.log(file);
    }
}

section("7. PACKAGE.JSON");

if (exists("package.json")) {
    try {
        const pkg = JSON.parse(
            fs.readFileSync(
                path.join(ROOT, "package.json"),
                "utf8"
            )
        );

        console.log(
            JSON.stringify(
                {
                    name: pkg.name,
                    scripts: pkg.scripts,
                    dependencies: pkg.dependencies,
                    devDependencies: pkg.devDependencies
                },
                null,
                2
            )
        );

    } catch (error) {
        console.log(
            "PACKAGE.JSON ERROR:",
            error.message
        );
    }
} else {
    console.log("package.json NOT FOUND");
}

section("8. BACKEND API ROUTES");

for (const file of routeFiles.sort()) {

    const text = fs.readFileSync(
        path.join(ROOT, file),
        "utf8"
    );

    const lines = text.split("\n");

    lines.forEach((line, index) => {

        if (
            /router\.(get|post|patch|put|delete)\s*\(/i.test(line) ||
            /app\.(get|post|patch|put|delete)\s*\(/i.test(line)
        ) {
            console.log(
                `${file}:${index + 1} ${line.trim()}`
            );
        }

    });
}

section("9. FRONTEND API REFERENCES");

let apiCount = 0;

for (const file of frontendFiles.filter(f => f.endsWith(".js"))) {

    const text = fs.readFileSync(
        path.join(ROOT, file),
        "utf8"
    );

    const lines = text.split("\n");

    lines.forEach((line, index) => {

        if (
            /fetch\s*\(/i.test(line) ||
            /axios/i.test(line) ||
            /\/api\//i.test(line)
        ) {

            apiCount++;

            console.log(
                `${file}:${index + 1} ${line.trim()}`
            );

        }

    });
}

if (apiCount === 0) {
    console.log("NO FRONTEND API REFERENCES DETECTED");
}

section("10. HTML SCRIPT REFERENCES");

for (const file of htmlFiles.sort()) {

    const text = fs.readFileSync(
        path.join(ROOT, file),
        "utf8"
    );

    const lines = text.split("\n");

    lines.forEach((line, index) => {

        if (/<script/i.test(line)) {

            console.log(
                `${file}:${index + 1} ${line.trim()}`
            );

        }

    });
}

section("11. CABLINK STATE / RIDE / REWARD REFERENCES");

const statePatterns = [
    "ride_engine",
    "ride_repository",
    "live_ride",
    "live_rides",
    "canonical",
    "reward",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVED",
    "PICKED_UP",
    "STARTED",
    "COMPLETED"
];

for (const file of jsFiles.sort()) {

    let text;

    try {
        text = fs.readFileSync(
            path.join(ROOT, file),
            "utf8"
        );
    } catch {
        continue;
    }

    const matched = statePatterns.filter(
        pattern => text.includes(pattern)
    );

    if (matched.length > 0) {

        console.log(
            `${file} -> ${matched.join(", ")}`
        );

    }

}

section("12. FINAL SUMMARY");

console.log("Total files:", allFiles.length);
console.log("JavaScript files:", jsFiles.length);
console.log("HTML files:", htmlFiles.length);
console.log("JSON files:", jsonFiles.length);
console.log("Frontend files:", frontendFiles.length);
console.log("Backend route files:", routeFiles.length);
console.log("Backend service files:", serviceFiles.length);
console.log("Test/audit files:", testFiles.length);
console.log("Frontend API references:", apiCount);

console.log(`
============================================================
INVENTORY COMPLETE
============================================================
`);
