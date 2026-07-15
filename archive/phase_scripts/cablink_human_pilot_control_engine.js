const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK HUMAN PILOT CONTROL ENGINE v1
=========================================
`);


const folders=[
"beta/pilot",
"beta/pilot/users",
"beta/pilot/rides",
"beta/pilot/issues",
"beta/pilot/reports"
];


folders.forEach(f=>{
fs.mkdirSync(f,{recursive:true});
console.log("✅",f);
});



// ================================
// PILOT USER REGISTRY
// ================================

fs.writeFileSync(

"beta/pilot/users/registry.js",

`

const fs=require("fs");

const file="beta/pilot/users/users.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(fs.readFileSync(file));

}


function add(user){

let users=load();

user.id="PILOT-"+Date.now();

user.created=new Date().toISOString();

users.push(user);

fs.writeFileSync(
file,
JSON.stringify(users,null,2)
);

return user;

}


module.exports={
add,
load
};

`

);



fs.writeFileSync(

"beta/pilot/users/users.json",

"[]"

);



// ================================
// RIDE TEST RECORDS
// ================================

fs.writeFileSync(

"beta/pilot/rides/ride_registry.js",

`

const fs=require("fs");

const file="beta/pilot/rides/rides.json";


function save(ride){

let rides=[];


if(fs.existsSync(file)){
rides=JSON.parse(fs.readFileSync(file));
}


rides.push(ride);


fs.writeFileSync(
file,
JSON.stringify(rides,null,2)
);


return ride;

}


module.exports={save};

`

);


fs.writeFileSync(

"beta/pilot/rides/rides.json",

"[]"

);



// ================================
// ISSUE TRACKER
// ================================


fs.writeFileSync(

"beta/pilot/issues/issue_tracker.js",

`

const fs=require("fs");

const file="beta/pilot/issues/issues.json";


function report(issue){

let data=[];


if(fs.existsSync(file)){
data=JSON.parse(fs.readFileSync(file));
}


issue.id="ISSUE-"+Date.now();

issue.time=new Date().toISOString();


data.push(issue);


fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);


return issue;

}


module.exports={report};

`

);


fs.writeFileSync(

"beta/pilot/issues/issues.json",

"[]"

);



// ================================
// PILOT READINESS CHECK
// ================================


fs.writeFileSync(

"beta/pilot/reports/pilot_health.js",

`

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


`

);



console.log(`

=========================================

🚕 HUMAN PILOT SYSTEM CREATED

Added:

✅ User registry
✅ Ride records
✅ Issue tracking
✅ Pilot health report

Existing CabLink systems untouched.

=========================================

`);

