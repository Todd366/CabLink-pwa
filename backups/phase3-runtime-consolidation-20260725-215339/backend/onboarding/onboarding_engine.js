
const store=require("../../database/production/store_engine");


function registerDriver(data){

return store.save(
"drivers",
{
id:data.id,
name:data.name,
phone:data.phone,
vehicle:data.vehicle,
verified:false,
created:new Date().toISOString()
}
);

}


function registerPassenger(data){

return store.save(
"passengers",
{
id:data.id,
name:data.name,
phone:data.phone,
created:new Date().toISOString()
}
);

}


module.exports={
registerDriver,
registerPassenger
};
