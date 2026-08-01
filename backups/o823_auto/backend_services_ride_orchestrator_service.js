

const state =
require("./ride_state_service");

const notify =
require("./notification_service");

const completion =
require("./ride_completion_service");

const rideRepository=require("../database/ride_repository");



function createRide(data){

return state.create(data);

}



function assignDriver(id,driver){

let ride =
state.get(id);


if(!ride){

console.log(
"❌ Ride not found:",
id
);

return null;

}


ride.driver=driver;

ride.status="DRIVER_FOUND";


state.update(
id,
"DRIVER_FOUND"
);


notify.notify({

ride:id,

driver,

user:ride.passenger,

type:"DRIVER_ASSIGNED",

message:"Driver has been assigned"

});


return ride;

}


function driverArrived(id){

let ride=
state.update(
id,
"DRIVER_ARRIVED"
);


notify.notify({

ride:id,

driver:ride.driver,

user:ride.passenger,

type:"DRIVER_ARRIVED",

message:"Your driver has arrived"

});


return ride;

}



function startTrip(id){

let ride=
state.update(
id,
"TRIP_STARTED"
);


notify.notify({

ride:id,

driver:ride.driver,

user:ride.passenger,

type:"TRIP_STARTED",

message:"Trip started"

});


return ride;

}



function finishTrip(id,fare){

let ride=
state.get(id);


ride.fare=fare;


let result=
completion.completeRide(
ride
);


notify.notify({

ride:id,

driver:ride.driver,

user:ride.passenger,

type:"TRIP_COMPLETED",

message:"Ride completed successfully"

});


return result;

}



module.exports={
createRide,
assignDriver,
driverArrived,
startTrip,
finishTrip
};

