const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT MISSION CONTROL v1
=========================================
`);

const dirs=[
"beta/pilot_mission",
"beta/pilot_mission/logs",
"beta/pilot_mission/reports"
];

dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


// PILOT RIDE SESSION

fs.writeFileSync(
"beta/pilot_mission/pilot_session.js",
`

const fs=require("fs");

const file=
"beta/pilot_mission/logs/pilot_sessions.json";


function start(data){

let sessions=[];

if(fs.existsSync(file)){
sessions=JSON.parse(fs.readFileSync(file));
}


let session={

id:"PILOT-RIDE-"+Date.now(),

passenger:data.passenger,

driver:data.driver,

pickup:data.pickup,

destination:data.destination,

events:[],

status:"ACTIVE",

created:new Date().toISOString()

};


sessions.push(session);


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


function event(id,data){

let sessions=JSON.parse(
fs.readFileSync(file)
);


let session=
sessions.find(x=>x.id===id);


if(session){

session.events.push({

...data,

time:new Date().toISOString()

});

}


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


module.exports={
start,
event
};

`
);


// PILOT EVIDENCE REPORT

fs.writeFileSync(
"beta/pilot_mission/reports/pilot_evidence_report.js",
`

const fs=require("fs");


const file=
"beta/pilot_mission/logs/pilot_sessions.json";


let sessions=[];


if(fs.existsSync(file)){
sessions=JSON.parse(fs.readFileSync(file));
}


let report={

date:new Date().toISOString(),

pilotRides:sessions.length,

completedRides:
sessions.filter(
x=>x.status==="COMPLETED"
).length,

gpsEvents:
sessions.filter(
x=>x.events.some(e=>e.type==="GPS_UPDATE")
).length,

payments:
sessions.filter(
x=>x.events.some(e=>e.type==="PAYMENT_CONFIRMED")
).length,

rewards:
sessions.filter(
x=>x.events.some(e=>e.type==="REWARD_ISSUED")
).length,

status:
sessions.length>0
?
"REAL PILOT DATA COLLECTING"
:
"WAITING FOR PILOT RIDE"

};


fs.writeFileSync(
"beta/pilot_mission/reports/PILOT_EVIDENCE_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);

`
);


console.log(`
=========================================

🚕 PILOT MISSION CONTROL CREATED

Ready for:

✅ Driver pilot
✅ Passenger pilot
✅ GPS evidence
✅ Fare evidence
✅ Payment evidence
✅ Reward evidence
✅ Feedback evidence

=========================================
`);

