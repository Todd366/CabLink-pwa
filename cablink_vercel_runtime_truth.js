#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("============================================================");
console.log("CABLINK — VERCEL RUNTIME ENTRYPOINT → RIDE ROUTE TRACE");
console.log("============================================================");

function exists(file) {
    return fs.existsSync(path.resolve(file));
}

function read(file) {
    try {
        return fs.readFileSync(path.resolve(file), "utf8");
    } catch {
        return "";
    }
}

function report(label, value) {
    console.log(`\n[${label}]`);
    console.log(value);
}

console.log("\n============================================================");
console.log("1. VERCEL CONFIGURATION");
console.log("============================================================");

for (const file of [
    "vercel.json",
    ".vercel/project.json",
    "package.json"
]) {
    console.log(`${file}: ${exists(file) ? "EXISTS" : "MISSING"}`);
}

console.log("\n============================================================");
console.log("2. API ENTRYPOINTS");
console.log("============================================================");

const apiDir = path.resolve("api");

if (exists("api")) {
    const files = fs.readdirSync(apiDir)
        .filter(f => f.endsWith(".js"));

    for (const file of files) {
        console.log(`api/${file}`);
    }
} else {
    console.log("api/ directory missing");
}

console.log("\n============================================================");
console.log("3. API INDEX CONTENT");
console.log("============================================================");

if (exists("api/index.js")) {
    console.log(read("api/index.js"));
} else {
    console.log("api/index.js MISSING");
}

console.log("\n============================================================");
console.log("4. VERCEL ROUTING REFERENCES");
console.log("============================================================");

for (const file of [
    "vercel.json",
    "api/index.js",
    "package.json"
]) {
    if (!exists(file)) continue;

    const content = read(file);

    console.log(`\n--- ${file} ---`);

    const lines = content.split("\n");

    lines.forEach((line, index) => {
        if (
            /routes|rewrites|api|server|app|rides/i.test(line)
        ) {
            console.log(
                `${index + 1}: ${line}`
            );
        }
    });
}

console.log("\n============================================================");
console.log("5. CANONICAL ROUTE CHAIN");
console.log("============================================================");

const chain = [
    "api/index.js",
    "backend/server/app.js",
    "backend/routes/rides.js",
    "backend/canonical/ride_engine.js",
    "backend/canonical/ride_repository.js",
    "backend/data/rides.json"
];

for (const file of chain) {
    console.log(
        `${exists(file) ? "✓" : "✗"} ${file}`
    );
}

console.log("\n============================================================");
console.log("6. CANONICAL IMPORT TRACE");
console.log("============================================================");

const imports = [
    ["api/index.js", "backend/server/app.js"],
    ["backend/server/app.js", "backend/routes/rides.js"],
    ["backend/routes/rides.js", "backend/canonical/ride_engine.js"],
    ["backend/canonical/ride_engine.js", "backend/canonical/ride_repository.js"]
];

for (const [source, target] of imports) {

    const sourceContent = read(source);

    const targetName = path.basename(target);

    const found =
        sourceContent.includes(targetName) ||
        sourceContent.includes(
            "./" + path.basename(path.dirname(target)) +
            "/" + targetName
        ) ||
        sourceContent.includes(
            "../" + path.basename(path.dirname(target)) +
            "/" + targetName
        );

    console.log(
        `${found ? "✓" : "✗"} ${source} → ${target}`
    );
}

console.log("\n============================================================");
console.log("7. /api/rides REGISTRATION SEARCH");
console.log("============================================================");

function walk(dir) {

    let results = [];

    if (!fs.existsSync(dir)) {
        return results;
    }

    for (const entry of fs.readdirSync(dir)) {

        if (
            entry === "node_modules" ||
            entry === ".git" ||
            entry === ".vercel"
        ) {
            continue;
        }

        const full = path.join(dir, entry);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            results =
                results.concat(
                    walk(full)
                );
        } else if (
            /\.(js|jsx|json)$/.test(entry)
        ) {
            results.push(full);
        }
    }

    return results;
}

for (const file of walk(process.cwd())) {

    let content = "";

    try {
        content =
            fs.readFileSync(
                file,
                "utf8"
            );
    } catch {
        continue;
    }

    if (
        content.includes('"/api/rides"') ||
        content.includes("'/api/rides'") ||
        content.includes('"/rides"') ||
        content.includes("'/rides'")
    ) {

        console.log(
            path.relative(
                process.cwd(),
                file
            )
        );

        const lines =
            content.split("\n");

        lines.forEach((line, index) => {

            if (
                /\/api\/rides|app\.use|router\.(get|post|patch|put|delete)/i
                    .test(line)
            ) {
                console.log(
                    `  ${index + 1}: ${line.trim()}`
                );
            }

        });
    }
}

console.log("\n============================================================");
console.log("8. RIDE REPOSITORY AUTHORITIES");
console.log("============================================================");

const repositories = [
    "backend/canonical/ride_repository.js",
    "backend/database/ride_repository.js",
    "backend/ride_store.js",
    "backend/storage/database.js",
    "backend/production/database_adapter.js"
];

for (const file of repositories) {

    console.log(
        `\n--- ${file} ---`
    );

    if (!exists(file)) {
        console.log("MISSING");
        continue;
    }

    const content = read(file);

    for (const line of content.split("\n")) {

        if (
            /require\(|firestore|rides\.json|cablink_db|writeFile|readFile|collection|document/i
                .test(line)
        ) {
            console.log(
                line.trim()
            );
        }

    }
}

console.log("\n============================================================");
console.log("9. FINAL DIAGNOSTIC");
console.log("============================================================");

const apiIndex = read("api/index.js");
const app = read("backend/server/app.js");
const rides = read("backend/routes/rides.js");

const apiLoadsApp =
    /server\/app|server\\app/.test(apiIndex);

const appLoadsRides =
    /routes\/rides|routes\\rides/.test(app);

const ridesLoadsCanonical =
    /canonical\/ride_engine|canonical\\ride_engine/.test(rides);

console.log(
    `api/index.js → backend/server/app.js: ${
        apiLoadsApp ? "CONNECTED" : "NOT PROVEN"
    }`
);

console.log(
    `backend/server/app.js → routes/rides.js: ${
        appLoadsRides ? "CONNECTED" : "NOT PROVEN"
    }`
);

console.log(
    `routes/rides.js → canonical/ride_engine.js: ${
        ridesLoadsCanonical ? "CONNECTED" : "NOT PROVEN"
    }`
);

console.log("\n============================================================");
console.log("TRACE COMPLETE");
console.log("============================================================");
