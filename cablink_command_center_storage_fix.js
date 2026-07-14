const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK COMMAND CENTER STORAGE FIX
=========================================
`);


const files=[

"beta/command/logs",
"beta/command/reports"

];


files.forEach(f=>{
fs.mkdirSync(f,{recursive:true});
console.log("✅",f);
});


const incidentFile=
"beta/command/logs/incidents.json";


if(!fs.existsSync(incidentFile)){

fs.writeFileSync(
incidentFile,
"[]"
);

console.log("✅ Incident database created");

}else{

console.log("✅ Incident database already exists");

}



const statusFile=
"beta/command/logs/status.json";


if(!fs.existsSync(statusFile)){

fs.writeFileSync(
statusFile,
JSON.stringify({

system:"CabLink Pilot Command Center",

status:"READY",

created:new Date().toISOString()

},null,2)
);

console.log("✅ Status database created");

}



console.log(`
=========================================
🚕 STORAGE READY
=========================================
`);

