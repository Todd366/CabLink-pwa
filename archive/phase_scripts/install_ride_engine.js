const fs=require("fs");

const file="frontend/js/ride_engine.js";

const code=`
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
`;

fs.writeFileSync(file,code);

console.log("✅ Created",file);


// inject into index.html

let html=fs.readFileSync("index.html","utf8");

if(!html.includes("ride_engine.js")){

html=html.replace(
"</body>",
'<script src="frontend/js/ride_engine.js"></script>\n</body>'
);

fs.writeFileSync("index.html",html);

console.log("✅ Injected ride_engine.js");

}else{

console.log("ℹ️ ride_engine.js already loaded");

}

