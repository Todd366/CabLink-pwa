const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK FINAL RELEASE GATE
=========================================
`);

const checks={

certification:
fs.existsSync("CABLINK_LAUNCH_CERTIFICATION_REPORT.txt"),

beta:
fs.existsSync("beta/tests/beta_run_report.txt"),

pilot:
fs.existsSync("beta/pilot/users/users.json"),

operations:
fs.existsSync("beta/operations/logs/events.json"),

humanPilot:
fs.existsSync(
"beta/human_pilot/participants/participants.json"
)

};


let score=Math.round(
Object.values(checks).filter(Boolean).length /
Object.keys(checks).length *100
);


console.log(checks);
console.log("RELEASE SCORE:",score+"%");


if(score!==100){

console.log("❌ RELEASE BLOCKED");
process.exit(1);

}


console.log(`
✅ ALL RELEASE GATES PASSED
`);

