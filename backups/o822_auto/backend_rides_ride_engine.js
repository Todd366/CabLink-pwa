
const store=require("../../database/production/store_engine");

const states=[
"REQUESTED",
"MATCHING",
"DRIVER_ACCEPTED",
"ARRIVED",
"STARTED",
"COMPLETED",
"CANCELLED"
];


function createRide(data){

let ride={
id:"RIDE-"+Date.now(),
passenger:data.passenger,
pickup:data.pickup,
destination:data.destination,
status:"REQUESTED",
created:new Date().toISOString()
};

store.save("rides",ride);

return ride;

}


function updateRide(id,status){

let ride=store
.get("rides")
.find(r=>r.id===id);

if(!ride) return null;

if(states.includes(status)){
ride.status=status;
}

store.save("rides",ride);

return ride;

}


module.exports={
createRide,
updateRide,
states
};
