

(function(){

"use strict";


window.CABLINK_OPS={


createTransaction:function(ride){

const fare=ride.fare||0;

return {

rideId:ride.id,

customerPayment:fare,

driverShare:
Number((fare*0.75).toFixed(2)),

platformFee:
Number((fare*0.10).toFixed(2)),

thbReward:1,

status:"PENDING",

createdAt:new Date().toISOString()

};

},



completeRide:function(ride){

ride.status="TRIP_COMPLETE";

ride.completedAt=new Date().toISOString();

return ride;

},



dispatch:function(ride,drivers){

if(!drivers||drivers.length===0){

return {
success:false,
message:"No drivers available"
};

}


return {

success:true,

driver:drivers[0],

rideId:ride.id,

status:"DRIVER_FOUND"

};

}


};


console.log("🚕 CabLink Operations Core ready");


})();
