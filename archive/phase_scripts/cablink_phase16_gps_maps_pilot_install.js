const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 16
GPS + MAPS + PILOT ACTIVATION
=========================================
`);

[
"backend/gps",
"backend/maps",
"backend/status",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// GPS SERVICE

fs.writeFileSync(
"backend/gps/gps_service.js",
`
const positions={};


function update(device,data){

positions[device]={

device,

latitude:data.latitude,

longitude:data.longitude,

accuracy:data.accuracy || null,

speed:data.speed || 0,

timestamp:new Date().toISOString()

};


return positions[device];

}


function get(device){

return positions[device] || null;

}


module.exports={
update,
get
};

`
);


// LIVE LOCATION STREAM

fs.writeFileSync(
"backend/gps/location_stream.js",
`
const gps=require("./gps_service");


function stream(device,location){

return gps.update(
device,
location
);

}


module.exports={
stream
};

`
);


// MAP PROVIDER ADAPTER

fs.writeFileSync(
"backend/maps/map_provider.js",
`
function provider(){

return {

provider:
process.env.MAPS_PROVIDER || "OPENSTREETMAP",

status:"READY"

};

}


function route(start,end){

return {

start,

end,

distance:"CALCULATING",

status:"ROUTE_REQUESTED"

};

}


module.exports={
provider,
route
};

`
);


// RIDE STATUS ENGINE

fs.writeFileSync(
"backend/status/ride_status.js",
`
const states=[

"REQUESTED",

"MATCHING",

"DRIVER_ACCEPTED",

"DRIVER_ARRIVING",

"PASSENGER_PICKED_UP",

"IN_PROGRESS",

"COMPLETED",

"REWARD_RELEASED"

];


function change(current,next){

return {

from:current,

to:next,

valid:
states.includes(next),

time:new Date().toISOString()

};

}


function available(){

return states;

}


module.exports={
change,
available
};

`
);


// GPS ROUTES

fs.writeFileSync(
"backend/routes/gps.js",
`
const router=require("express").Router();

const gps=require("../gps/gps_service");


router.post(
"/update",
(req,res)=>{

res.json(
gps.update(
req.body.device,
req.body.location
)
);

}

);


router.get(
"/:device",
(req,res)=>{

res.json(
gps.get(req.params.device)
);

}

);


module.exports=router;

`
);


// PILOT TEST

fs.writeFileSync(
"backend/testing/pilot_activation_test.js",
`
const gps=require("../gps/gps_service");
const maps=require("../maps/map_provider");
const status=require("../status/ride_status");


console.log({

map:
maps.provider(),


route:
maps.route(
"Gaborone CBD",
"Airport"
),


driverLocation:
gps.update(
"DRIVER_PHONE",
{
latitude:-24.628,
longitude:25.923,
accuracy:5
}
),


rideFlow:
status.change(
"DRIVER_ACCEPTED",
"DRIVER_ARRIVING"
)

});

`
);


console.log(`
=========================================

✅ PHASE 16 CREATED

Added:

✅ GPS service
✅ Live location layer
✅ Maps adapter
✅ Ride status machine
✅ Pilot activation test

NEXT:

Phase 17:
Real PWA screens + driver/passenger map UI

=========================================
`);

