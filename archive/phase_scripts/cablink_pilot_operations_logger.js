const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT OPERATIONS LOGGER v1
=========================================
`);


const folders=[
"beta/operations",
"beta/operations/logs",
"beta/operations/reports"
];


folders.forEach(f=>{
fs.mkdirSync(f,{recursive:true});
console.log("✅",f);
});



// ================================
// EVENT LOGGER
// ================================

fs.writeFileSync(

"beta/operations/event_logger.js",

`
const fs=require("fs");

const file=
"beta/operations/logs/events.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(
fs.readFileSync(file)
);

}



function log(event){

let events=load();


event.id=
"EVENT-"+Date.now();


event.time=
new Date().toISOString();


events.push(event);


fs.writeFileSync(
file,
JSON.stringify(events,null,2)
);


return event;

}



function all(){

return load();

}


module.exports={
log,
all
};

`

);



// ================================
// PILOT SESSION ENGINE
// ================================


fs.writeFileSync(

"beta/operations/session_engine.js",

`

const fs=require("fs");


const file=
"beta/operations/logs/sessions.json";


function start(){

let sessions=[];


if(fs.existsSync(file)){
sessions=JSON.parse(
fs.readFileSync(file)
);
}


let session={

id:"SESSION-"+Date.now(),

start:new Date().toISOString(),

status:"ACTIVE",

rides:0,

errors:0

};


sessions.push(session);


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


module.exports={
start
};

`

);



// ================================
// DAILY PILOT REPORT
// ================================


fs.writeFileSync(

"beta/operations/reports/daily_report.js",

`

const fs=require("fs");


function read(file){

if(!fs.existsSync(file)){
return [];
}

return JSON.parse(
fs.readFileSync(file)
);

}


let events=
read(
"beta/operations/logs/events.json"
);


let sessions=
read(
"beta/operations/logs/sessions.json"
);



let report={

date:new Date().toISOString(),

totalEvents:
events.length,

activeSessions:
sessions.length,

ridesCompleted:
events.filter(
x=>x.type==="RIDE_COMPLETED"
).length,

failures:
events.filter(
x=>x.type==="ERROR"
).length

};



let reliability=

report.totalEvents===0
?
100
:
Math.round(
((report.totalEvents-report.failures)
/
report.totalEvents)*100
);



report.systemReliability=
reliability+"%";


fs.writeFileSync(

"beta/operations/reports/DAILY_PILOT_REPORT.json",

JSON.stringify(report,null,2)

);


console.log(report);

`

);



console.log(`

=========================================

🚕 PILOT OPERATIONS LOGGER CREATED

Added:

✅ Event tracking
✅ Session tracking
✅ Daily reliability reports
✅ Failure monitoring

Existing CabLink systems untouched.

=========================================

`);

