const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK GEO RELEASE GATE
=========================================
`);

const checks={

geoEngine:
fs.existsSync("beta/geo/geo_engine.js"),

geoReport:
fs.existsSync("beta/geo/reports/GEO_CERTIFICATION_REPORT.json"),

rideCertification:
fs.existsSync("CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"),

pilotLayer:
fs.existsSync("beta/human_pilot/participants/participants.json")

};


let score=Math.round(

Object.values(checks)
.filter(Boolean)
.length /
Object.keys(checks).length
*100

);


console.log(checks);

console.log(
"Geo Release Score:",
score+"%"
);


console.log(

score===100
?
"✅ GEO LAYER APPROVED"
:
"❌ GEO LAYER BLOCKED"

);

