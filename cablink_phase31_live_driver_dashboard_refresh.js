const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 31
LIVE DRIVER ECONOMY DASHBOARD REFRESH
BSTM + THB REAL DATA VIEW
=========================================
`);

[
"frontend/services",
"frontend/testing",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// FRONTEND LIVE DASHBOARD SERVICE

fs.writeFileSync(
"frontend/services/driver_dashboard_live.js",
`

const taskApi=require("../api/task_api");


async function loadDashboard(driver){


const tasks =
await taskApi.getTasks();


return {

driver,

tasks:
tasks.filter(
task =>
!task.driver ||
task.driver===driver
),

source:"LIVE_API",

lastUpdated:
new Date().toISOString()

};


}


module.exports={
loadDashboard
};

`
);


// BACKEND DRIVER ECONOMY ROUTE MOUNT FILE

fs.writeFileSync(
"backend/routes/driver_dashboard_api.js",
`

const router=require("express").Router();

const wallet=require("../rewards/wallet_service");
const history=require("../rewards/reward_history");


router.get(
"/driver/:id/dashboard",
(req,res)=>{


res.json({

driver:req.params.id,

wallet:
wallet.wallet(req.params.id),

rewards:
history.getDriver(req.params.id),

timestamp:
new Date().toISOString()

});


}

);


module.exports=router;

`
);


// DASHBOARD REFRESH COMPONENT

fs.writeFileSync(
"frontend/components/live_driver_dashboard.js",
`

function render(data){

return {

screen:"Live Driver Dashboard",

driver:data.driver,

tasks:data.tasks,

connection:data.source,

updated:data.lastUpdated,

status:"ONLINE"

};

}


module.exports={
render
};

`
);


// TEST

fs.writeFileSync(
"frontend/testing/live_driver_dashboard_test.js",
`

const service=require("../services/driver_dashboard_live");
const dashboard=require("../components/live_driver_dashboard");


(async()=>{


const data=
await service.loadDashboard(
"DRIVER001"
);


console.log(

dashboard.render(data)

);


})();

`
);


console.log(`
=========================================

✅ PHASE 31 CREATED

Added:

✅ Live dashboard service
✅ Driver dashboard API foundation
✅ Real task refresh
✅ Online driver state

RUN:

node frontend/testing/live_driver_dashboard_test.js

NEXT:

Mount API route into server + connect UI buttons

=========================================
`);

