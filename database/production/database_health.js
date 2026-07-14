
const store=require("./store_engine");


function health(){

let db={

users:
store.get("users").length,

drivers:
store.get("drivers").length,

rides:
store.get("rides").length,

payments:
store.get("payments").length,

rewards:
store.get("rewards").length,

locations:
store.get("locations").length

};


return {

status:"ONLINE",

database:db,

time:new Date().toISOString()

};

}


module.exports={
health
};
