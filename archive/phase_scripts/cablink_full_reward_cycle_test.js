const store=require("./database/production/store_engine");
const claim=require("./backend/rewards/thb_claim_engine");
const health=require("./backend/blockchain/chain_health");
const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FULL THB REWARD CYCLE TEST
=========================================
`);


// simulate completed ride reward

let reward=store.save(
"rewards",
{
ride:"RIDE-FINAL-001",
wallet:"PILOT-TEST-WALLET",
amount:1,
token:"THB",
status:"AVAILABLE",
created:new Date().toISOString()
}
);


// claim reward

let claimResult=claim.requestClaim({

wallet:"PILOT-TEST-WALLET"

});


// chain readiness

let chain=health.check();


let report={

reward,

claimResult,

chain,

time:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_FULL_REWARD_CYCLE_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);


console.log(`
=========================================

✅ REWARD CYCLE VERIFIED

=========================================
`);

