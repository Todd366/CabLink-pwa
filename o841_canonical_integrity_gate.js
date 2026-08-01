const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

console.log(`
==============================================
CABLINK O.8.41 — CANONICAL INTEGRITY GATE
==============================================
`);

const results = [];

function pass(name, detail=""){
    results.push({name, pass:true, detail});
    console.log(`PASS  ${name}${detail ? " — "+detail : ""}`);
}

function fail(name, detail=""){
    results.push({name, pass:false, detail});
    console.log(`FAIL  ${name}${detail ? " — "+detail : ""}`);
}

function exists(file){
    return fs.existsSync(file);
}

function read(file){
    return fs.readFileSync(file,"utf8");
}


// ============================================================
// 1. REQUIRED CANONICAL COMPONENTS
// ============================================================

console.log(`
==============================================
1. CANONICAL COMPONENTS
==============================================
`);

const required = [

"backend/canonical/ride_engine.js",
"backend/canonical/ride_repository.js",
"backend/services/ride_completion_service.js",
"backend/services/canonical_reward_service.js",
"backend/routes/completion_api.js",
"backend/routes/canonical_reward_api.js",
"backend/server/app.js"

];

for(const file of required){

if(exists(file)){
    pass(
        "Required component",
        file
    );
}else{
    fail(
        "Required component",
        file
    );
}

}


// ============================================================
// 2. CANONICAL STATE MACHINE
// ============================================================

console.log(`
==============================================
2. STATE MACHINE
==============================================
`);

const engineFile =
"backend/canonical/ride_engine.js";

if(exists(engineFile)){

const engine =
read(engineFile);

const states = [

"REQUESTED",
"MATCHING",
"DRIVER_ASSIGNED",
"DRIVER_ARRIVED",
"PICKED_UP",
"STARTED",
"COMPLETED",
"CANCELLED"

];

for(const state of states){

if(engine.includes(state)){
    pass(
        "Canonical state",
        state
    );
}else{
    fail(
        "Canonical state",
        state
    );
}

}

if(
engine.includes("function transition") &&
engine.includes("repository.update")
){

pass(
"Canonical transition writer",
"ride_engine.transition()"
);

}else{

fail(
"Canonical transition writer"
);

}

}else{

fail(
"State machine audit",
"engine missing"
);

}


// ============================================================
// 3. COMPLETION MUST USE CANONICAL ENGINE
// ============================================================

console.log(`
==============================================
3. COMPLETION AUTHORITY
==============================================
`);

const completionFile =
"backend/services/ride_completion_service.js";

if(exists(completionFile)){

const completion =
read(completionFile);

if(
completion.includes("engine.getRide") &&
completion.includes("engine.transition") &&
completion.includes("engine.STATES.COMPLETED")
){

pass(
"Completion uses canonical engine"
);

}else{

fail(
"Completion uses canonical engine"
);

}

if(
completion.includes(
"createRewardForCompletedRide"
)
){

pass(
"Completion uses canonical reward service"
);

}else{

fail(
"Completion uses canonical reward service"
);

}

}else{

fail(
"Completion service exists"
);

}


// ============================================================
// 4. API ROUTES MOUNTED
// ============================================================

console.log(`
==============================================
4. API ROUTE MOUNTING
==============================================
`);

const appFile =
"backend/server/app.js";

if(exists(appFile)){

const app =
read(appFile);

const routeChecks = [

[
'"/api/rides"',
"Ride API"
],

[
'"/api/rewards"',
"Reward API"
],

[
'"/api",completionRoutes',
"Completion API"
],

[
'"/api",liveRideRoutes',
"Live Ride API"
]

];

for(const [needle,name] of routeChecks){

if(app.includes(needle)){

pass(
"Mounted route",
name
);

}else{

fail(
"Mounted route",
name
);

}

}

}


// ============================================================
// 5. LEGACY LIVE SERVICE STATE MUTATION CHECK
// ============================================================

console.log(`
==============================================
5. LEGACY STATE MUTATION CHECK
==============================================
`);

const liveFile =
"backend/services/live_ride_service.js";

if(exists(liveFile)){

const live =
read(liveFile);

const blocked =
live.includes(
"Legacy status mutation blocked"
);

const blockedAssign =
live.includes(
"Legacy DRIVER_FOUND mutation blocked"
);

if(blocked){

pass(
"Legacy status mutation blocked"
);

}else{

fail(
"Legacy status mutation protection"
);

}

if(blockedAssign){

pass(
"Legacy driver mutation blocked"
);

}else{

fail(
"Legacy driver mutation protection"
);

}

}


// ============================================================
// 6. COMPLETION ROUTE CONTRACT
// ============================================================

console.log(`
==============================================
6. COMPLETION CONTRACT
==============================================
`);

const completionRoute =
read(
"backend/routes/completion_api.js"
);

if(
completionRoute.includes("req.body.id") &&
completionRoute.includes("req.body.driverId")
){

pass(
"Completion API receives canonical identity"
);

}else{

fail(
"Completion API canonical identity"
);

}


// ============================================================
// 7. REWARD EXACTLY-ONCE CONTRACT
// ============================================================

console.log(`
==============================================
7. REWARD EXACTLY-ONCE
==============================================
`);

const rewardFile =
"backend/services/canonical_reward_service.js";

if(exists(rewardFile)){

const reward =
read(rewardFile);

if(
reward.includes("ALREADY_REWARDED")
){

pass(
"Duplicate reward detection"
);

}else{

fail(
"Duplicate reward detection"
);

}

if(
reward.includes("REWARD_CREATED")
){

pass(
"Reward creation status"
);

}else{

fail(
"Reward creation status"
);

}

if(
reward.includes("rideId")
){

pass(
"Reward tied to ride identity"
);

}else{

fail(
"Reward ride identity"
);

}

}else{

fail(
"Canonical reward service exists"
);

}


// ============================================================
// 8. SYNTAX CHECK
// ============================================================

console.log(`
==============================================
8. JAVASCRIPT SYNTAX
==============================================
`);

const syntaxFiles = [

"backend/canonical/ride_engine.js",
"backend/canonical/ride_repository.js",
"backend/services/ride_completion_service.js",
"backend/services/canonical_reward_service.js",
"backend/routes/completion_api.js",
"backend/routes/canonical_reward_api.js",
"backend/server/app.js"

];

const { execFileSync } =
require("child_process");

for(const file of syntaxFiles){

try{

execFileSync(
"node",
["--check",file],
{stdio:"ignore"}
);

pass(
"Syntax",
file
);

}catch{

fail(
"Syntax",
file
);

}

}


// ============================================================
// 9. CANONICAL REPOSITORY STATE AUDIT
// ============================================================

console.log(`
==============================================
9. REPOSITORY STATE AUDIT
==============================================
`);

try{

const repo =
require(
"./backend/canonical/ride_repository"
);

const rides =
repo.all();

let invalidCompleted = 0;

for(const ride of rides){

if(
ride.status === "COMPLETED" &&
!ride.completedAt
){

invalidCompleted++;

}

}

if(invalidCompleted === 0){

pass(
"Completed ride integrity",
"all completed rides have completion timestamp"
);

}else{

fail(
"Completed ride integrity",
invalidCompleted+
" completed rides missing completedAt"
);

}

const completed =
rides.filter(
r=>r.status==="COMPLETED"
);

pass(
"Canonical rides loaded",
String(rides.length)
);

pass(
"Completed rides",
String(completed.length)
);

}catch(error){

fail(
"Repository audit",
error.message
);

}


// ============================================================
// 10. REWARD RIDE UNIQUENESS AUDIT
// ============================================================

console.log(`
==============================================
10. REWARD UNIQUENESS
==============================================
`);

try{

const rewardService =
require(
"./backend/services/canonical_reward_service"
);

const serviceText =
read(rewardFile);

if(
serviceText.includes(
"ALREADY_REWARDED"
)
){

pass(
"Exactly-once reward contract present"
);

}

}catch(error){

fail(
"Reward uniqueness audit",
error.message
);

}


// ============================================================
// FINAL REPORT
// ============================================================

console.log(`
==============================================
O.8.41 INTEGRITY REPORT
==============================================
`);

const passed =
results.filter(
r=>r.pass
).length;

const failed =
results.filter(
r=>!r.pass
).length;

console.log(
"PASSED:",
passed
);

console.log(
"FAILED:",
failed
);

console.log(
"TOTAL:",
results.length
);

if(failed === 0){

console.log(`
==============================================
CABLINK O.8.41 — INTEGRITY GATE: PASS
==============================================
`);

process.exit(0);

}else{

console.log(`
==============================================
CABLINK O.8.41 — INTEGRITY GATE: FAIL
==============================================
`);

for(const r of results){

if(!r.pass){

console.log(
"FAILED:",
r.name,
r.detail || ""
);

}

}

process.exit(1);

}

