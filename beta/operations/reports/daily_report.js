

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

