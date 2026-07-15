

const state =
require("./ride_state_service");

const notify =
require("./notification_service");

const completion =
require("./ride_completion_service");



function createRide(data){

return state.create(data);

}



function assignDriver(id,driver){

let ride=
state.update(
id,
"DRIVER_FOUND"
);

ride.driver=driver;

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

