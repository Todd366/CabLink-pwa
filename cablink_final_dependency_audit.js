const fs=require("fs");

console.log(`
=========================================
🔍 CABLINK FINAL DEPENDENCY AUDIT
=========================================
`);

const checks={

ethers:
fs.existsSync("node_modules/ethers"),

dotenv:
fs.existsSync("node_modules/dotenv"),

database:
fs.existsSync("database/production/store_engine.js"),

reward:
fs.existsSync("backend/rewards/thb_claim_engine.js"),

blockchain:
fs.existsSync("backend/blockchain/thb_transaction_engine.js"),

frontend:
fs.existsSync("frontend"),

env:
fs.existsSync(".env")

};


let ready=
Object.values(checks)
.filter(Boolean).length;


let total=
Object.keys(checks).length;


console.log({

checks,

score:
Math.round(ready/total*100)+"%",

time:new Date().toISOString()

});


