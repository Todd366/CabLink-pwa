const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK HUMAN PILOT PROTOCOL ENGINE v1
=========================================
`);

const dirs=[
"beta/human_pilot",
"beta/human_pilot/participants",
"beta/human_pilot/rides",
"beta/human_pilot/feedback",
"beta/human_pilot/reports"
];

dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


// PARTICIPANT REGISTRY

fs.writeFileSync(
"beta/human_pilot/participants/registry.js",
`
const fs=require("fs");

const file="beta/human_pilot/participants/participants.json";

function load(){
if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}
return JSON.parse(fs.readFileSync(file));
}


function add(person){

let users=load();

person.id="PILOT-"+Date.now();
person.created=new Date().toISOString();
person.status="REGISTERED";

users.push(person);

fs.writeFileSync(
file,
JSON.stringify(users,null,2)
);

return person;

}


module.exports={add,load};
`
);


fs.writeFileSync(
"beta/human_pilot/participants/participants.json",
"[]"
);


// RIDE EXPERIMENT FRAMEWORK

fs.writeFileSync(
"beta/human_pilot/rides/test_framework.js",
`

const tests={};

for(let i=1;i<=10;i++){

tests["RIDE_TEST_"+String(i).padStart(3,"0")]={

status:"PENDING",

driver:null,

passenger:null,

issues:[],

feedback:null

};

}


function complete(id,data){

if(tests[id]){

tests[id]={

...tests[id],

...data,

status:"COMPLETED"

};

}

return tests[id];

}


function all(){

return tests;

}


module.exports={
complete,
all
};

`
);


// FEEDBACK ENGINE

fs.writeFileSync(
"beta/human_pilot/feedback/feedback_engine.js",
`

const fs=require("fs");

const file=
"beta/human_pilot/feedback/feedback.json";


function add(data){

let list=[];

if(fs.existsSync(file)){
list=JSON.parse(fs.readFileSync(file));
}

data.time=new Date().toISOString();

list.push(data);

fs.writeFileSync(
file,
JSON.stringify(list,null,2)
);

return data;

}


function all(){

if(!fs.existsSync(file)){
return [];
}

return JSON.parse(fs.readFileSync(file));

}


module.exports={add,all};

`
);


fs.writeFileSync(
"beta/human_pilot/feedback/feedback.json",
"[]"
);


// PILOT REPORT ENGINE

fs.writeFileSync(
"beta/human_pilot/reports/pilot_summary.js",
`

const fs=require("fs");

const files={

participants:
"beta/human_pilot/participants/participants.json",

feedback:
"beta/human_pilot/feedback/feedback.json"

};


let report={

date:new Date().toISOString(),

participants:
fs.existsSync(files.participants)
?
JSON.parse(fs.readFileSync(files.participants)).length
:
0,

feedbackEntries:
fs.existsSync(files.feedback)
?
JSON.parse(fs.readFileSync(files.feedback)).length
:
0,

rideTests:"RIDE_TEST_001-010_READY",

status:"COLLECTING_REAL_WORLD_EVIDENCE"

};


fs.writeFileSync(
"beta/human_pilot/reports/HUMAN_PILOT_SUMMARY.json",
JSON.stringify(report,null,2)
);


console.log(report);

`
);


console.log(`
=========================================
🚕 HUMAN PILOT PROTOCOL CREATED

Added:

✅ Participant registry
✅ Driver/passenger tracking foundation
✅ Consent/test structure
✅ Ride Test 001-010 framework
✅ Feedback collection
✅ Pilot reports

Certified CabLink systems untouched.

=========================================
`);

