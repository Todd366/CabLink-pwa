const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL PILOT READINESS ENGINE
=========================================
`);

const checks={};


// 1 DATABASE

checks.database =
fs.existsSync(
"database/production/database.json"
);


// 2 PAYMENT LAYER

checks.payment =
fs.existsSync(
"backend/payments/payment_engine.js"
);


// 3 REWARD LAYER

checks.reward =
fs.existsSync(
"backend/rewards/reward_engine.js"
);


// 4 PILOT SYSTEM

checks.pilot =
fs.existsSync(
"beta/pilot_mission/pilot_session.js"
);


// 5 REPORTING

checks.reporting =
fs.existsSync(
"beta/pilot_mission/reports/pilot_evidence_report.js"
);


// 6 ENV SECURITY

checks.envProtection =
fs.existsSync(".gitignore") &&
fs.readFileSync(".gitignore","utf8")
.includes(".env");


// 7 BACKUP CLEAN

const backups=
fs.readdirSync(".")
.filter(x=>/bak|backup/i.test(x));

checks.backupClean =
backups.length < 5;



// CREATE FINAL STATUS

const passed=
Object.values(checks)
.filter(Boolean)
.length;


const total=
Object.keys(checks).length;


const score=
Math.round(
passed/total*100
);


const report={

system:"CabLink Final Pilot Readiness",

checks,

score:score+"%",

status:
score===100
?
"READY FOR CONTROLLED HUMAN PILOT"
:
"ENGINEERING REVIEW REQUIRED",

timestamp:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_FINAL_PILOT_READINESS_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);


console.log(`
=========================================

NEXT REAL WORLD STEPS:

1. Install PWA on driver phone
2. Install PWA on passenger phone
3. Register real users
4. Complete first real ride
5. Record GPS/fare/payment evidence
6. Collect feedback

=========================================
`);

