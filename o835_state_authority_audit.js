const repo =
require("./backend/canonical/ride_repository");

const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.35 — STATE AUTHORITY AUDIT
==============================================
`);

let rides =
repo.all();

let recent =
rides.slice(-5);

console.log("CANONICAL RIDES:");

for(const r of recent){

console.log({
id:r.id,
status:r.status,
driverId:r.driverId
});

}


console.log(`
SEARCH COMPLETION WRITERS
`);

const files=[
"backend/services/ride_completion_service.js",
"backend/services/live_ride_service.js",
"backend/services/ride_orchestrator_service.js",
"backend/routes/completion_api.js"
];


for(const f of files){

if(fs.existsSync(f)){

let d=fs.readFileSync(f,"utf8");

console.log("\nFILE:",f);

console.log(
d.includes("status")?"HAS STATE WRITE":"NO STATE WRITE"
);

}

}


console.log(`
==============================================
O.8.35 COMPLETE
==============================================
`);
