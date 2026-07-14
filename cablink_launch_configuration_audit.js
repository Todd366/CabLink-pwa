const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK LAUNCH CONFIGURATION AUDIT
=========================================
`);

require("dotenv").config();


const checks={

RPC_URL:
!!process.env.RPC_URL,

CONTRACT_ADDRESS:
!!process.env.CONTRACT_ADDRESS &&
!process.env.CONTRACT_ADDRESS.includes("your_"),

TREASURY_WALLET:
!!process.env.TREASURY_WALLET &&
!process.env.TREASURY_WALLET.includes("your_"),

PRIVATE_KEY:
!!process.env.PRIVATE_KEY &&
!process.env.PRIVATE_KEY.includes("your_"),

PAYMENT_PROVIDER_KEY:
!!process.env.PAYMENT_PROVIDER_KEY &&
!process.env.PAYMENT_PROVIDER_KEY.includes("your_"),

MAPS_API_KEY:
!!process.env.MAPS_API_KEY &&
!process.env.MAPS_API_KEY.includes("your_")

};


let passed=
Object.values(checks)
.filter(Boolean)
.length;


let total=
Object.keys(checks).length;


let report={

system:"CabLink Launch Configuration Audit",

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
"READY FOR LIVE INTEGRATION"
:
"WAITING FOR EXTERNAL SERVICES",

time:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_LAUNCH_CONFIGURATION_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);

