const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
============================================
🚕 CABLINK FINAL PRODUCTION GATEKEEPER v2
============================================
`);

let results={};

function exists(path){
    return fs.existsSync(path);
}

function check(name,items){

    let missing=[];

    items.forEach(i=>{
        if(!exists(i)){
            missing.push(i);
        }
    });

    let passed=missing.length===0;

    results[name]=passed;

    console.log(
        passed
        ?"✅ "+name
        :"⚠️ "+name
    );

    if(missing.length){
        missing.forEach(x=>{
            console.log("   ❌",x);
        });
    }

    return passed;
}


// ================================
// CORE APPLICATION
// ================================

check(
"Frontend Core",
[
"index.html",
"manifest.json",
"sw.js",
"frontend/js/app.js",
"frontend/js/core.js"
]
);


// ================================
// RIDE ENGINE
// ================================

check(
"Ride Intelligence",
[
"frontend/js/ride_engine.js",
"frontend/js/operations_core.js",
"frontend/js/simulation_engine.js",
"fare_engine.js",
"frontend/js/financial_intelligence.js"
]
);


// ================================
// GPS + REALTIME
// ================================

check(
"GPS Tracking Layer",
[
"frontend/js/gps/location_engine.js",
"frontend/js/realtime/tracking_engine.js",
"backend/services/location/location_service.js",
"backend/services/realtime/realtime_service.js",
"database/schema/location.json"
]
);


// ================================
// BACKEND
// ================================

check(
"Backend Services",
[
"backend/server.js",
"backend/services/ride_service.js",
"backend/services/driver_service.js",
"backend/services/payment_service.js",
"backend/services/reward_service.js",
"backend/services/notifications/notification_service.js"
]
);


// ================================
// DATABASE
// ================================

check(
"Database Schema",
[
"database/schema/users.json",
"database/schema/drivers.json",
"database/schema/rides.json",
"database/schema/transactions.json",
"database/schema/rewards.json",
"database/schema/notifications.json"
]
);


// ================================
// EXPANSION ARCHITECTURE
// ================================

check(
"Future Expansion Space",
[
"future",
"frontend/js/ecosystem",
"backend/modules"
]
);


// ================================
// ADMIN
// ================================

check(
"Admin Foundation",
[
"admin"
]
);


// ================================
// CODE INTELLIGENCE SCAN
// ================================

console.log(`
============================================
🧠 FUNCTION INTELLIGENCE SCAN
============================================
`);


let files=[];

function scan(dir){

if(!exists(dir)) return;

fs.readdirSync(dir).forEach(f=>{

let p=dir+"/"+f;

if(fs.statSync(p).isDirectory()){
scan(p);
}
else{
files.push(p);
}

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
"calculateFare",
"CABLINK_RIDE",
"CABLINK_OPS",
"CABLINK_FINANCE",
"THB",
"/api/",
"location",
"tracking",
"driver",
"payment"
].forEach(term=>{

if(content.includes(term)){
console.log("✅",term);
}else{
console.log("⚠️ Missing",term);
}

});


// ================================
// SERVER CHECK
// ================================

console.log(`
============================================
🌐 SERVER VALIDATION
============================================
`);

try{

execSync(
"node --check backend/server.js",
{stdio:"inherit"}
);

console.log("✅ Backend syntax valid");

}catch(e){

console.log("❌ Backend syntax error");

}


// ================================
// GIT CHECK
// ================================

console.log(`
============================================
📦 GIT STATUS
============================================
`);

try{

console.log(
execSync(
"git status --short",
{encoding:"utf8"}
) || "Clean"
);

}catch(e){}



// ================================
// SCORE
// ================================

let total=Object.keys(results).length;

let passed=
Object.values(results)
.filter(Boolean)
.length;


let score=Math.round(
(passed/total)*100
);


let report=`

CABLINK FINAL PRODUCTION GATEKEEPER v2

Date:
${new Date().toISOString()}

Architecture Score:
${score}%

Sections:

${JSON.stringify(results,null,2)}

IMPORTANT:
Architecture readiness does not replace real device testing.
GPS requires real phones.
Realtime requires connected clients.
Payments require live provider testing.

`;


fs.writeFileSync(
"CABLINK_FINAL_PRODUCTION_REPORT.txt",
report
);


console.log(`
============================================

🚕 CABLINK FINAL SCORE

${score}%

Report:
CABLINK_FINAL_PRODUCTION_REPORT.txt

============================================
`);

