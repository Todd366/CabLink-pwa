const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL FREEZE AUDIT
=========================================
`);

const checks={};


// Core files

[
"backend/rides/ride_engine.js",
"backend/fare/fare_engine.js",
"backend/matching/matching_engine.js",
"backend/auth/auth_engine.js",
"backend/payments/payment_engine.js",
"backend/payments/payment_provider_adapter.js",
"backend/rewards/reward_engine.js",
"backend/rewards/thb_service.js",
"backend/rides/settlement_engine.js",
"backend/users/wallet_manager.js",
"database/production/database.json"
].forEach(file=>{

checks[file]=fs.existsSync(file);

});


// Check database writes

let db={};

try{

db=JSON.parse(
fs.readFileSync(
"database/production/database.json",
"utf8"
)
);

checks.databaseReadable=true;

checks.transactionsExist=
Array.isArray(db.transactions);

checks.rewardsExist=
Array.isArray(db.rewards);

checks.walletsExist=
Array.isArray(db.wallets);

}catch(e){

checks.databaseReadable=false;

}


// Check secrets

checks.envProtected=
fs.existsSync(".gitignore") &&
fs.readFileSync(".gitignore","utf8")
.includes(".env");


// Score

let passed=
Object.values(checks)
.filter(Boolean)
.length;

let total=
Object.keys(checks).length;


let report={

system:"CabLink Final Freeze Audit",

passed,

total,

score:
Math.round(
passed/total*100
)+"%",

checks,

status:
passed===total
?
"ENGINEERING FROZEN - READY FOR FIELD PILOT"
:
"REVIEW REQUIRED",

timestamp:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_FINAL_FREEZE_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);

