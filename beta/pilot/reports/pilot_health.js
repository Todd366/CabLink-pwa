

const fs=require("fs");


let checks={

beta:
fs.existsSync("beta"),

certification:
fs.existsSync("CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"),

realityTest:
fs.existsSync("beta/tests/beta_run_report.txt"),

dashboard:
fs.existsSync("beta/dashboard/live_state.json"),

pilotDatabase:
fs.existsSync("beta/pilot/users/users.json")

};


let score=
Math.round(
Object.values(checks)
.filter(Boolean)
.length /
Object.keys(checks).length
*100
);


console.log({

CABLINK_HUMAN_PILOT_STATUS:checks,

score:score+"%",

status:
score===100?
"APPROVED FOR CONTROLLED PILOT":
"BLOCKED"

});


