const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT COMMAND CENTER v1
=========================================
`);


const dirs=[
"beta/command",
"beta/command/logs",
"beta/command/reports"
];


dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
console.log("✅",d);
});


// =================================
// DAILY PILOT STATUS
// =================================


fs.writeFileSync(

"beta/command/pilot_status.js",

`

const fs=require("fs");


const status={

date:new Date().toISOString(),

driversRegistered:0,

driversApproved:0,

driversOnline:0,

passengersRegistered:0,

ridesRequested:0,

ridesCompleted:0,

failedRides:0,

gpsIssues:0,

paymentIssues:0,

rewardIssues:0

};


function update(field,value){

status[field]=value;

fs.writeFileSync(
"beta/command/logs/status.json",
JSON.stringify(status,null,2)
);

return status;

}


function get(){

return status;

}


module.exports={
update,
get
};

`

);


// =================================
// PILOT TEST SCORECARD
// =================================


fs.writeFileSync(

"beta/command/test_scorecard.js",

`

const tests={

driverRegistration:false,

passengerRegistration:false,

rideRequest:false,

driverAssignment:false,

gpsTracking:false,

fareCalculation:false,

paymentRecord:false,

rewardIssue:false

};


function complete(test){

if(tests[test]!==undefined){

tests[test]=true;

}

return tests;

}


function score(){

return Math.round(

Object.values(tests)
.filter(Boolean)
.length

/

Object.keys(tests).length

*100

);

}


module.exports={
complete,
score
};

`

);


// =================================
// INCIDENT LOGGER
// =================================


fs.writeFileSync(

"beta/command/incident_logger.js",

`

const fs=require("fs");


const file="beta/command/logs/incidents.json";


function add(data){

let incidents=[];


if(fs.existsSync(file)){

incidents=JSON.parse(
fs.readFileSync(file)
);

}


data.id="INC-"+Date.now();

data.time=new Date().toISOString();


incidents.push(data);


fs.writeFileSync(
file,
JSON.stringify(incidents,null,2)
);


return data;

}


module.exports={add};

`

);


fs.writeFileSync(
"beta/command/logs/incidents.json",
"[]"
);


// =================================
// FINAL PILOT DECISION ENGINE
// =================================


fs.writeFileSync(

"beta/command/reports/pilot_decision.js",

`

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


let decision=
score===100
?
"GO - CONTROLLED PILOT"
:
"NO GO - FIX REQUIRED";


let report=`

CABLINK PILOT DECISION REPORT

Score:
${score}%


Decision:
${decision}


Checks:

${JSON.stringify(checks,null,2)}

`;


fs.writeFileSync(
"beta/command/reports/PILOT_DECISION_REPORT.txt",
report
);


console.log(report);

`

);


console.log(`

=========================================

🚕 PILOT COMMAND CENTER CREATED

Added:

✅ Operational status tracking
✅ Test scorecard
✅ Incident logging
✅ Pilot GO/NO-GO engine

Core CabLink systems untouched.

=========================================

`);

