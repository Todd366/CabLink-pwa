const fs = require("fs");
const path = require("path");

console.log(`

CABLINK O.8.58 — DATABASE REPOSITORY + ORCHESTRATOR TRACE

`);

const ROOT = process.cwd();

const targets = [
"backend/database",
"backend/services",
"backend/routes",
"backend/server",
"backend",
"frontend"
];

const exactTargets = [
"backend/database/ride_repository.js",
"backend/services/ride_orchestrator_service.js",
"backend/services/ride_state_service.js",
"backend/canonical/ride_repository.js",
"backend/canonical/ride_engine.js"
];

function collectFiles(dir) {

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
        return collectFiles(relative);
    }

    if (
        path.extname(entry.name) === ".js" ||
        path.extname(entry.name) === ".html"
    ) {
        return [relative];
    }

    return [];

});

}

const files = [
...new Set(
targets.flatMap(collectFiles)
)
];

const findings = [];

const patterns = [

{
    name: "DATABASE RIDE REPOSITORY IMPORT",
    regex: /(?:require|import).*database[\/\\]ride_repository/g
},

{
    name: "CANONICAL RIDE REPOSITORY IMPORT",
    regex: /(?:require|import).*canonical[\/\\]ride_repository/g
},

{
    name: "RIDE ORCHESTRATOR IMPORT",
    regex: /(?:require|import).*ride_orchestrator_service/g
},

{
    name: "RIDE STATE SERVICE IMPORT",
    regex: /(?:require|import).*ride_state_service/g
},

{
    name: "RIDE REPOSITORY CREATE",
    regex: /(?:repository|rides)\.create\s*\(/g
},

{
    name: "RIDE REPOSITORY UPDATE",
    regex: /(?:repository|rides)\.update\s*\(/g
},

{
    name: "RIDE REPOSITORY FIND",
    regex: /(?:repository|rides)\.(?:find|findById|get)\s*\(/g
},

{
    name: "RIDE REPOSITORY ALL",
    regex: /(?:repository|rides)\.all\s*\(/g
},

{
    name: "DATABASE READ",
    regex: /\bdb\.read\s*\(/g
},

{
    name: "DATABASE WRITE",
    regex: /\bdb\.write\s*\(/g
},

{
    name: "RIDE ID GENERATION",
    regex: /(?:id\s*:\s*["'`]RIDE-|["'`]RIDE-["'`]\s*\+)/g
},

{
    name: "RIDE STATUS WRITE",
    regex: /\b(?:status|ride\.status)\s*[:=]/g
},

{
    name: "RIDE STATUS MUTATION",
    regex: /\b(?:ride|r)\.status\s*=/g
},

{
    name: "RIDE EVENT",
    regex: /DRIVER_ASSIGNED|DRIVER_ARRIVED|TRIP_STARTED|TRIP_COMPLETED|RIDE_COMPLETED/g
},

{
    name: "API RIDE ROUTE",
    regex: /\/api\/rides|\/api\/ride|ride\/complete|economy\/ride/g
}

];

for (const file of files) {

const full =
    path.join(ROOT, file);

let text;

try {

    text =
        fs.readFileSync(
            full,
            "utf8"
        );

} catch {

    continue;

}

const lines =
    text.split("\n");

lines.forEach(
    (line, index) => {

        for (
            const pattern
            of patterns
        ) {

            pattern.regex.lastIndex = 0;

            if (
                pattern.regex.test(line)
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

/* ========================================================
A. EXACT TARGET FILES
======================================================== */

console.log(`

A. EXACT TARGET FILES

`);

for (const file of exactTargets) {

const exists =
    fs.existsSync(
        path.join(ROOT, file)
    );

console.log(
    exists
        ? `[FOUND] ${file}`
        : `[MISSING] ${file}`
);

}

/* ========================================================
B. DATABASE REPOSITORY
======================================================== */

console.log(`

B. DATABASE RIDE REPOSITORY

`);

const databaseRepo =
"backend/database/ride_repository.js";

const databaseFindings =
findings.filter(
x =>
x.file === databaseRepo
);

databaseFindings.forEach(
x =>
console.log(
"${x.file}:${x.line}",
"[${x.type}]",
x.code
)
);

/* ========================================================
C. DATABASE REPOSITORY CONSUMERS
======================================================== */

console.log(`

C. DATABASE REPOSITORY CONSUMERS

`);

const databaseConsumers =
findings.filter(
x =>
x.type ===
"DATABASE RIDE REPOSITORY IMPORT"
);

if (
databaseConsumers.length === 0
) {

console.log(
    "NONE DETECTED"
);

} else {

databaseConsumers.forEach(
    x =>
        console.log(
            `${x.file}:${x.line}`,
            x.code
        )
);

}

/* ========================================================
D. ORCHESTRATOR REFERENCES
======================================================== */

console.log(`

D. RIDE ORCHESTRATOR REFERENCES

`);

const orchestratorFindings =
findings.filter(
x =>
x.file.includes(
"ride_orchestrator_service.js"
) ||
x.type ===
"RIDE ORCHESTRATOR IMPORT"
);

orchestratorFindings.forEach(
x =>
console.log(
"${x.file}:${x.line}",
"[${x.type}]",
x.code
)
);

/* ========================================================
E. RIDE STATE SERVICE REFERENCES
======================================================== */

console.log(`

E. RIDE STATE SERVICE REFERENCES

`);

const stateServiceFindings =
findings.filter(
x =>
x.file.includes(
"ride_state_service.js"
) ||
x.type ===
"RIDE STATE SERVICE IMPORT"
);

stateServiceFindings.forEach(
x =>
console.log(
"${x.file}:${x.line}",
"[${x.type}]",
x.code
)
);

/* ========================================================
F. DATABASE READ / WRITE PATHS
======================================================== */

console.log(`

F. DATABASE READ / WRITE PATHS

`);

findings
.filter(
x =>
x.type === "DATABASE READ" ||
x.type === "DATABASE WRITE"
)
.forEach(
x =>
console.log(
"${x.file}:${x.line}",
"[${x.type}]",
x.code
)
);

/* ========================================================
G. RIDE ID GENERATION
======================================================== */

console.log(`

G. RIDE ID GENERATION

`);

findings
.filter(
x =>
x.type ===
"RIDE ID GENERATION"
)
.forEach(
x =>
console.log(
"${x.file}:${x.line}",
x.code
)
);

/* ========================================================
H. RIDE STATE WRITERS
======================================================== */

console.log(`

H. RIDE STATE WRITERS

`);

findings
.filter(
x =>
x.type ===
"RIDE STATUS WRITE" ||
x.type ===
"RIDE STATUS MUTATION"
)
.forEach(
x =>
console.log(
"${x.file}:${x.line}",
"[${x.type}]",
x.code
)
);

/* ========================================================
I. RIDE EVENTS
======================================================== */

console.log(`

I. RIDE EVENTS

`);

findings
.filter(
x =>
x.type ===
"RIDE EVENT"
)
.forEach(
x =>
console.log(
"${x.file}:${x.line}",
x.code
)
);

/* ========================================================
J. API SURFACE
======================================================== */

console.log(`

J. API SURFACE

`);

findings
.filter(
x =>
x.type ===
"API RIDE ROUTE"
)
.forEach(
x =>
console.log(
"${x.file}:${x.line}",
x.code
)
);

/* ========================================================
K. CLASSIFICATION
======================================================== */

console.log(`

K. O.8.58 CLASSIFICATION

`);

const databaseConsumerFiles =
[
...new Set(
databaseConsumers.map(
x => x.file
)
)
];

const orchestratorFiles =
[
...new Set(
orchestratorFindings.map(
x => x.file
)
)
];

const stateServiceFiles =
[
...new Set(
stateServiceFindings.map(
x => x.file
)
)
];

const databaseWriteFiles =
[
...new Set(
findings
.filter(
x =>
x.type ===
"DATABASE WRITE"
)
.map(
x => x.file
)
)
];

const rideIdFiles =
[
...new Set(
findings
.filter(
x =>
x.type ===
"RIDE ID GENERATION"
)
.map(
x => x.file
)
)
];

console.log(
"DATABASE REPOSITORY CONSUMER FILES:",
databaseConsumerFiles.length
);

console.log(
"ORCHESTRATOR-RELATED FILES:",
orchestratorFiles.length
);

console.log(
"STATE-SERVICE-RELATED FILES:",
stateServiceFiles.length
);

console.log(
"DATABASE WRITE FILES:",
databaseWriteFiles.length
);

console.log(
"RIDE ID GENERATION FILES:",
rideIdFiles.length
);

/* ========================================================
L. CONFLICT QUESTIONS
======================================================== */

console.log(`

L. O.8.58 CONFLICT QUESTIONS

1. Is backend/database/ride_repository.js active?

2. Who imports the database ride repository?

3. Does the database repository create rides?

4. Does it update rides?

5. Does it generate ride IDs?

6. What storage layer does it ultimately use?

7. Does ride_orchestrator_service.js create or mutate
   ride state?

8. Does ride_state_service.js create or mutate
   ride state?

9. Are either services connected to active routes?

10. Does the database repository represent a second
    ride persistence authority?

11. Does it overlap with canonical/ride_repository.js?

12. Does it generate or manipulate ride IDs that could
    conflict with canonical IDs?

13. Are there active API paths reaching the database
    repository?

14. Is the database repository a legacy subsystem,
    migration subsystem, supporting subsystem,
    or active second authority?

15. Can it be safely disconnected?

========================================================
NO FILES MODIFIED.
NO FILES DELETED.

O.8.58 COMPLETE

`);

