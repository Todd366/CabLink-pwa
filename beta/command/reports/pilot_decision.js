

const fs=require("fs");


let checks={

certification:
fs.existsSync("CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"),

beta:
fs.existsSync("beta/tests/beta_run_report.txt"),

humanPilot:
fs.existsSync("beta/pilot/users/users.json"),

dashboard:
fs.existsSync("beta/dashboard/live_state.json"),

commandCenter:
fs.existsSync("beta/command/logs/incidents.json")

};


let score=Math.round(

Object.values(checks)
.filter(Boolean)
.length
/
Object.keys(checks).length
*100

);


let decision =
score===100
?
"GO - CONTROLLED PILOT"
:
"NO GO - FIX REQUIRED";


let report =
"CABLINK PILOT DECISION REPORT\n\n"+
"Score: "+score+"%\n\n"+
"Decision: "+decision+"\n\n"+
JSON.stringify(checks,null,2);


fs.writeFileSync(
"beta/command/reports/PILOT_DECISION_REPORT.txt",
report
);


console.log(report);

