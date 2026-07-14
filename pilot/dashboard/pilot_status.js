
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

