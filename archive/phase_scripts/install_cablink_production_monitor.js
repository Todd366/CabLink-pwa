const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PRODUCTION MONITOR INSTALLER
=========================================
`);

const file="cablink_production_monitor.js";


const code=`

const fs=require("fs");
const {execSync}=require("child_process");


console.log(\`
=========================================
🚕 CABLINK PRODUCTION HEALTH REPORT
=========================================
\`);


function exists(file){
 return fs.existsSync(file);
}


function check(name,items){

 let missing=[];

 items.forEach(x=>{
  if(!exists(x)){
    missing.push(x);
  }
 });


 let status=
 missing.length===0
 ?"✅ PASS"
 :"⚠️ INCOMPLETE";


 console.log(
 "\\n"+name,
 status
 );


 if(missing.length){
   missing.forEach(x=>{
    console.log("   ❌",x);
   });
 }

 return missing.length===0;

}



let score=0;
let total=0;


function section(name,items){

 total++;

 if(check(name,items)){
   score++;
 }

}



section(
"Frontend Core",
[
"index.html",
"manifest.json",
"sw.js",
"frontend/js/app.js",
"frontend/js/core.js"
]
);



section(
"Ride Intelligence",
[
"frontend/js/ride_engine.js",
"frontend/js/operations_core.js",
"fare_engine.js",
"frontend/js/financial_intelligence.js",
"frontend/js/simulation_engine.js"
]
);



section(
"Backend",
[
"backend/server.js",
"backend/services/ride_service.js",
"backend/services/driver_service.js",
"backend/services/payment_service.js",
"backend/services/reward_service.js"
]
);



section(
"Database Layer",
[
"database/schema/users.json",
"database/schema/drivers.json",
"database/schema/rides.json",
"database/schema/transactions.json",
"database/schema/rewards.json"
]
);



section(
"Production Structure",
[
"config/version.json",
"backend/controllers",
"backend/routes",
"backend/middleware",
"logs"
]
);



console.log(`
=========================================
FUNCTION CHECK
=========================================
`);


let files=[];

function scan(dir){

if(!fs.existsSync(dir)) return;

let list=fs.readdirSync(dir);

list.forEach(f=>{

let p=dir+"/"+f;

if(fs.statSync(p).isDirectory())
 scan(p);
else
 files.push(p);

});

}


scan("frontend");
scan("backend");


let content="";

files.forEach(f=>{
 try{
 content+=fs.readFileSync(f,"utf8");
 }catch(e){}
});


[
"bookRide",
"calculateFare",
"CABLINK_RIDE",
"CABLINK_OPS",
"CABLINK_FINANCE",
"THB",
"/api/"
].forEach(x=>{

console.log(
content.includes(x)
?"✅ "+x
:"❌ Missing "+x
);

});



console.log(`
=========================================
GIT STATUS
=========================================
`);

try{

console.log(
execSync("git status --short",{encoding:"utf8"}) || "✅ Clean"
);

}catch(e){

console.log("Git check unavailable");

}



let percent=
Math.round(
(score/total)*100
);


console.log(`
=========================================
FINAL RESULT
=========================================

System Sections:
${score}/${total}

Readiness:
${percent}%

=========================================
Audit Complete
=========================================
`);

fs.writeFileSync(
"cablink_health_report.txt",
"CabLink Readiness: "+percent+"%\\n"
);

console.log("📄 Report saved: cablink_health_report.txt");

`;

fs.writeFileSync(file,code);

console.log("✅ Created",file);

