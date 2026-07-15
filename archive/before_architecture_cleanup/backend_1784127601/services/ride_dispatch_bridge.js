const dispatchService = require("./dispatch_service");
const matchingService = require("./driver_matching_service");
const dispatchEngine = require("../dispatch/dispatch_engine");


function dispatchRide(ride){

const request = dispatchService.createRequest({

pickup:ride.pickup,
destination:ride.dropoff,
passenger:ride.passenger || "USER001"

});


const drivers = matchingService.nearby({
lat:0,
lng:0
});


if(drivers.length){

const selected =
dispatchEngine.select(
drivers,
ride
);


if(selected){

dispatchService.dispatch(
request.id,
[selected.driver]
);

return {
request,
driver:selected.driver
};

}

}


return {
request,
driver:null
};

}


module.exports={
dispatchRide
};
