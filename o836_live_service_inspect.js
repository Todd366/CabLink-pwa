const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.36 — LIVE SERVICE INSPECTION
==============================================
`);

const file=
"backend/services/live_ride_service.js";

if(!fs.existsSync(file)){
 console.log("MISSING");
 process.exit();
}

let d=fs.readFileSync(file,"utf8");

console.log(
d.substring(0,5000)
);

console.log(`
==============================================
O.8.36 COMPLETE
==============================================
`);
