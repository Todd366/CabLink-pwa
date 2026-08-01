
const store=require("../../database/production/store_engine");


function record(data){

let event={

id:"GPS-"+Date.now(),

driver:data.driver,

latitude:data.latitude,

longitude:data.longitude,

time:new Date().toISOString()

};


store.save(
"locations",
event
);


return event;

}


function history(driver){

return store
.get("locations")
.filter(x=>x.driver===driver);

}


module.exports={
record,
history
};
