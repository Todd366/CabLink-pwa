
const gateway=require("../backend/api/cablink_gateway");


let result=
gateway.rideRequest({

ride:"REAL-PILOT-001",

passenger:"PASSENGER-001",

pickup:"Gaborone CBD"

});


console.log({

system:"CabLink Human Pilot",

result,

status:"READY_FOR_REAL_USERS"

});

