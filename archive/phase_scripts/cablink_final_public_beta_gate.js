const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PUBLIC BETA REALITY GATE
=========================================
`);

const checks={

core:
fs.existsSync("CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"),

geo:
fs.existsSync("beta/geo/reports/GEO_CERTIFICATION_REPORT.json"),

gps:
fs.existsSync("beta/live_gps/reports/GPS_REPORT.json"),

hailing:
fs.existsSync("beta/hailing_tests/hailing_test.js"),

pilot:
fs.existsSync("beta/human_pilot/participants/participants.json"),

missionControl:
fs.existsSync("beta/pilot_mission/reports/pilot_evidence_report.js")

};


let score=Math.round(
Object.values(checks)
.filter(Boolean).length /
Object.keys(checks).length*100
);


console.log(checks);

console.log(
"READINESS:",
score+"%"
);


console.log(
score===100
?
"🚕 READY FOR CONTROLLED PUBLIC BETA"
:
"🚧 PILOT EVIDENCE REQUIRED"
);

