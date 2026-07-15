const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 36
ECONOMY ENGINE LEDGER BRIDGE
AUTOMATIC FINANCIAL RECORDING
=========================================
`);

const file="backend/services/ride_economy_service.js";

let code=fs.readFileSync(file,"utf8");


if(!code.includes("economy_ledger_service")){

code=code.replace(
'const history=require("../rewards/reward_history");',
`const history=require("../rewards/reward_history");
const ledger=require("./economy_ledger_service");`
);


code=code.replace(
'return record;',
`
ledger.recordRide(record);

return record;
`
);


code=code.replace(
'history.add(reward);',
`
history.add(reward);

ledger.recordReward(reward);
`
);


fs.writeFileSync(file,code);

console.log("✅ Economy ledger bridge installed");

}else{

console.log("ℹ️ Bridge already installed");

}


console.log(`
=========================================

DONE

Restart backend:

pkill -f "node backend/server.js"

npm run backend

Test:

node backend/testing/phase34_economy_test.js

Then inspect:

cat backend/data/economy_ledger.json

=========================================
`);

