
// CabLink Ride Intelligence Engine v1

(function(){

"use strict";

window.CABLINK_RIDE = {

states:[
"REQUESTED",
"SEARCHING_DRIVER",
"DRIVER_FOUND",
"DRIVER_ACCEPTED",
"ARRIVING",
"PICKUP_COMPLETE",
"TRIP_ACTIVE",
"TRIP_COMPLETE",
"PAYMENT_COMPLETE",
"REWARD_SENT",
"RATED"
],


create:function(data){

return {

id:"CL-"+Date.now(),

customer:data.customer||null,

pickup:data.pickup||null,

dropoff:data.dropoff||null,

vehicle:data.vehicle||"standard",

fare:data.fare||0,

status:"REQUESTED",

createdAt:new Date().toISOString()

};

},


update:function(ride,newStatus){

if(!this.states.includes(newStatus)){
return false;
}

ride.status=newStatus;

ride.updatedAt=new Date().toISOString();

return ride;

},


validate:function(ride){

return !!(
ride.id &&
ride.pickup &&
ride.dropoff &&
ride.status
);

}

};


console.log("🚕 CabLink Ride Intelligence Engine loaded");

})();
