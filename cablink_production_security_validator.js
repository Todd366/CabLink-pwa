const fs=require("fs");
require("dotenv").config();

console.log(`
=========================================
🔐 CABLINK PRODUCTION SECURITY VALIDATOR
=========================================
`);

function realValue(value){

return value &&
!value.includes("your_") &&
!value.includes("here") &&
value.length>10;

}


const checks={

RPC_URL:
realValue(process.env.RPC_URL),

CONTRACT_ADDRESS:
/^0x[a-fA-F0-9]{40}$/.test(
process.env.CONTRACT_ADDRESS||""
),

TREASURY_WALLET:
/^0x[a-fA-F0-9]{40}$/.test(
process.env.TREASURY_WALLET||""
),

PRIVATE_KEY:
realValue(process.env.PRIVATE_KEY),

};


let passed=
Object.values(checks)
.filter(Boolean).length;


let total=
Object.keys(checks).length;


let report={

system:"CabLink Production Security Validator",

checks,

score:
Math.round(passed/total*100)+"%",

status:
passed===total
?
"SECURE FOR BLOCKCHAIN EXECUTION"
:
"WAITING FOR REAL SECRETS",

time:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_SECURITY_VALIDATION.json",
JSON.stringify(report,null,2)
);


console.log(report);

