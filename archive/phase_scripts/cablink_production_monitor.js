
const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK FINAL READINESS AUDIT
=========================================
`);


let passed=0;
let total=0;


function checkSection(name,files){

total++;

let missing=[];

files.forEach(f=>{
 if(!fs.existsSync(f)){
  missing.push(f);
 }
});


if(missing.length===0){

console.log("✅",name);
passed++;

}else{

console.log("⚠️",name);

missing.forEach(x=>{
 console.log("   ❌",x);
});

}

}



checkSection(
"Frontend Application",
[
"index.html",
"manifest.json",
"sw.js",
"frontend/js/app.js",
"frontend/js/core.js"
]
);



checkSection(
"Ride System",
[
"frontend/js/ride_engine.js",
"frontend/js/operations_core.js",
"fare_engine.js",
"frontend/js/financial_intelligence.js",
"frontend/js/simulation_engine.js"
]
);



checkSection(
"Backend System",
[
"backend/server.js",
"backend/services/ride_service.js",
"backend/services/driver_service.js",
"backend/services/payment_service.js",
"backend/services/reward_service.js"
]
);



checkSection(
"Database Architecture",
[
"database/schema/users.json",
"database/schema/drivers.json",
"database/schema/rides.json",
"database/schema/transactions.json",
"database/schema/rewards.json"
]
);



checkSection(
"Production Infrastructure",
[
"config/version.json",
"backend/routes",
"backend/controllers",
"backend/middleware",
"logs"
]
);



checkSection(
"Growth Architecture",
[
"future",
"frontend/js/ecosystem",
"backend/modules"
]
);



console.log(`

=========================================
INTELLIGENCE FUNCTION CHECK
=========================================
`);



let scanFiles=[];


function scan(dir){

if(!fs.existsSync(dir)) return;

fs.readdirSync(dir).forEach(f=>{

let p=dir+"/"+f;

if(fs.statSync(p).isDirectory())
scan(p);
else
scanFiles.push(p);

});

}


scan("frontend");
scan("backend");


let data="";


scanFiles.forEach(f=>{

try{
data+=fs.readFileSync(f,"utf8");
}catch(e){}

});


[
"calculateFare",
"CABLINK_RIDE",
"CABLINK_OPS",
"CABLINK_FINANCE",
"THB",
"/api/"
].forEach(x=>{

if(data.includes(x))
console.log("✅",x);
else
console.log("❌ Missing",x);

});



console.log(`

=========================================
FINAL SCORE
=========================================

Completed Sections:
${passed}/${total}

Readiness:
${Math.round((passed/total)*100)}%

=========================================
`);



fs.writeFileSync(
"cablink_final_readiness_report.txt",
"CabLink readiness: "+
Math.round((passed/total)*100)+
"%"
);


console.log(
"📄 Report created"
);


try{

console.log("\nGit:");
console.log(
execSync("git status --short",{encoding:"utf8"}) || "Clean"
);

}catch(e){}

