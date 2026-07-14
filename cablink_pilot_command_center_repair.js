const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT COMMAND CENTER REPAIR
=========================================
`);


const file="cablink_pilot_command_center_engine.js";


if(!fs.existsSync(file)){
console.log("❌ Engine file missing");
process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


// remove broken report generator section and rebuild safely

const reportEngine=`

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
"CABLINK PILOT DECISION REPORT\\n\\n"+
"Score: "+score+"%\\n\\n"+
"Decision: "+decision+"\\n\\n"+
JSON.stringify(checks,null,2);


fs.writeFileSync(
"beta/command/reports/PILOT_DECISION_REPORT.txt",
report
);


console.log(report);

`;


// create standalone report file directly

fs.mkdirSync(
"beta/command/reports",
{recursive:true}
);


fs.writeFileSync(
"beta/command/reports/pilot_decision.js",
reportEngine
);


console.log("✅ Pilot decision engine repaired");

console.log(`
=========================================
🚕 REPAIR COMPLETE
=========================================
`);

