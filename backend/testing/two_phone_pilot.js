

function simulate(){

return {

passengerDevice:{
status:"CONNECTED",
role:"PASSENGER"
},

driverDevice:{
status:"CONNECTED",
role:"DRIVER"
},

rideFlow:[

"PASSENGER_REQUESTS_RIDE",

"SERVER_RECEIVES_REQUEST",

"DRIVER_NOTIFIED",

"DRIVER_ACCEPTS",

"GPS_TRACKING_STARTED",

"RIDE_COMPLETED",

"THB_REWARD_CREATED"

],

status:"READY_FOR_HUMAN_TEST"

};

}


module.exports={
simulate
};

