

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

