const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 30
LIVE DRIVER ECONOMY DATA CONNECTION
BSTM + THB BACKEND LINK
=========================================
`);

[
"frontend/services",
"frontend/testing",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// LIVE DRIVER ECONOMY SERVICE

fs.writeFileSync(
"frontend/services/live_driver_economy.js",
`

const taskApi=require("../api/task_api");


async function loadDriverEconomy(driver){

const tasks =
await taskApi.getTasks();


return {

driver,

tasks:

tasks.filter(
task=>
!task.driver ||
task.driver===driver
),

source:"LIVE_BACKEND"

};

}


module.exports={
loadDriverEconomy
};

`
);


// BACKEND DRIVER ECONOMY ROUTE

fs.writeFileSync(
"backend/routes/driver_economy.js",
`

const router=require("express").Router();

const wallet=require("../rewards/wallet_service");
const history=require("../rewards/reward_history");


router.get(
"/driver/:id/economy",
(req,res)=>{


res.json({

driver:req.params.id,

wallet:
wallet.wallet(req.params.id),

rewards:
history.getDriver(req.params.id)

});


}

);


module.exports=router;

`
);


// LIVE TEST

fs.writeFileSync(
"frontend/testing/live_driver_economy_test.js",
`

const service=require("../services/live_driver_economy");


(async()=>{

console.log(

await service.loadDriverEconomy(
"DRIVER001"
)

);

})();

`
);


console.log(`
=========================================

✅ PHASE 30 CREATED

Added:

✅ Live task loading
✅ Driver economy service
✅ Wallet API foundation
✅ Reward history connection

RUN:

node frontend/testing/live_driver_economy_test.js

NEXT:

Phase 31:
Mount driver economy API + live dashboard refresh

=========================================
`);

