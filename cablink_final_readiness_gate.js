const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL REALITY READINESS GATE
=========================================
`);


const checks={


// Existing certified layers

coreCertification:
fs.existsSync(
"CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"
),

betaFoundation:
fs.existsSync(
"beta/tests/beta_run_report.txt"
),

geoCertification:
fs.existsSync(
"beta/geo/reports/GEO_CERTIFICATION_REPORT.json"
),

pilotSystem:
fs.existsSync(
"beta/human_pilot/participants/participants.json"
),

operationsMonitoring:
fs.existsSync(
"beta/operations/logs/events.json"
),


// Production requirements


liveGPS:

fs.existsSync(
"beta/live_gps/live_location_engine.js"
),


database:

fs.existsSync(
"database/production"
),


authentication:

fs.existsSync(
"backend/auth"
),


paymentProduction:

fs.existsSync(
"backend/payments"
),


realPilotEvidence:

fs.existsSync(
"beta/human_pilot/reports/HUMAN_PILOT_SUMMARY.json"
)

};



let passed=
Object.values(checks)
.filter(Boolean)
.length;


let total=
Object.keys(checks).length;


let score=Math.round(
passed/total*100
);



console.log(checks);

console.log(`

CABLINK REALITY SCORE

${score}%


`);

if(score===100){

console.log(`
=========================================

🚕 CABLINK PRODUCTION READY

=========================================
`);

}else{

console.log(`
=========================================

🚧 CABLINK STILL NEEDS REALITY LAYERS

Missing:

${Object.keys(checks)
.filter(x=>!checks[x])
.join("\n")}

=========================================
`);

}


fs.writeFileSync(

"beta/final_readiness_report.json",

JSON.stringify(
{
checks,
score:score+"%",
date:new Date().toISOString()
},
null,
2)

);


