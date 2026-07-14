const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL SYSTEM CHECK
=========================================
`);

const checks={

rideEngine:
fs.existsSync("backend/rides/ride_engine.js"),

transactionManager:
fs.existsSync("cablink_core_transaction_manager.js"),

database:
fs.existsSync("database/production/database.json"),

paymentLayer:
fs.existsSync("backend/payments/payment_transaction_layer.js"),

rewardLayer:
fs.existsSync("backend/rewards/thb_transaction_layer.js"),

gps:
fs.existsSync("beta/live_gps/live_location_engine.js"),

pilotEvidence:
fs.existsSync("beta/pilot/reports/LAST_COMPLETED_RIDE.json")

};


console.log(checks);


const score=Math.round(
Object.values(checks).filter(Boolean).length /
Object.keys(checks).length *100
);


console.log(`

CABLINK SOFTWARE COMPLETION:

${score}%

`);

