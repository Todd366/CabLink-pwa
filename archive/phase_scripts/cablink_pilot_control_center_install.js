const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT CONTROL CENTER
=========================================
`);

[
"pilot/dashboard"
].forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


fs.writeFileSync(
"pilot/dashboard/pilot_status.js",
`
const health=require("../../backend/monitoring/system_health");
const cloud=require("../../backend/providers/cloud_provider");
const store=require("../../database/production/store_engine");


function report(){

return {

system:"CabLink Pilot Control Center",

health:
health.check(),

cloud:
cloud.status(),

database:{

users:
store.get("users").length,

drivers:
store.get("drivers").length,

rides:
store.get("rides").length,

rewards:
store.get("rewards").length,

transactions:
store.get("blockchain_transactions").length

},

timestamp:
new Date().toISOString()

};

}


console.log(report());

module.exports={
report
};

`
);


fs.writeFileSync(
"pilot/dashboard/run_dashboard.js",
`
require("./pilot_status");
`
);


console.log(`
=========================================

✅ PILOT CONTROL CENTER CREATED

Added:

✅ System health dashboard
✅ Cloud status
✅ Database statistics
✅ Reward tracking
✅ Blockchain tracking

RUN:

node pilot/dashboard/run_dashboard.js

=========================================
`);

