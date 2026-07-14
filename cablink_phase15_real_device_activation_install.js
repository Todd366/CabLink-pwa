const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 15
REAL DEVICE ACTIVATION LAYER
=========================================
`);

[
"backend/mobile",
"backend/matching",
"backend/trips",
"backend/heartbeat",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DEVICE REGISTRY

fs.writeFileSync(
"backend/mobile/device_registry.js",
`
const devices={};


function register(data){

devices[data.device]={

device:data.device,

user:data.user,

role:data.role,

platform:data.platform,

status:"CONNECTED",

lastSeen:new Date().toISOString()

};


return devices[data.device];

}


function heartbeat(device){

if(devices[device]){

devices[device].lastSeen=
new Date().toISOString();

devices[device].status="ACTIVE";

}

return devices[device];

}


function all(){

return Object.values(devices);

}


module.exports={
register,
heartbeat,
all
};

`
);


// DRIVER MATCHING ENGINE

fs.writeFileSync(
"backend/matching/driver_matcher.js",
`
function find(drivers,ride){

return drivers
.filter(
d=>d.online===true
)
.map(
d=>({

driver:d,

distance:
Math.abs(
d.latitude-ride.latitude
)+
Math.abs(
d.longitude-ride.longitude
)

})
)
.sort(
(a,b)=>
a.distance-b.distance
)[0];

}


module.exports={
find
};

`
);


// TRIP STATE

fs.writeFileSync(
"backend/trips/trip_manager.js",
`
const trips={};


function start(data){

let trip={

id:"TRIP-"+Date.now(),

ride:data.ride,

driver:data.driver,

passenger:data.passenger,

status:"STARTED",

started:new Date().toISOString()

};


trips[trip.id]=trip;

return trip;

}


function update(id,status){

if(trips[id]){

trips[id].status=status;

}

return trips[id];

}


function all(){

return Object.values(trips);

}


module.exports={
start,
update,
all
};

`
);


// DEVICE HEARTBEAT

fs.writeFileSync(
"backend/heartbeat/device_monitor.js",
`
function check(device){

return {

device,

status:"ONLINE",

checked:new Date().toISOString()

};

}


module.exports={
check
};

`
);


// REAL DEVICE ROUTES

fs.writeFileSync(
"backend/routes/mobile.js",
`
const router=require("express").Router();

const devices=require("../mobile/device_registry");
const trips=require("../trips/trip_manager");


router.post(
"/register",
(req,res)=>{

res.json(
devices.register(req.body)
);

}

);


router.post(
"/heartbeat/:id",
(req,res)=>{

res.json(
devices.heartbeat(req.params.id)
);

}

);


router.post(
"/trip/start",
(req,res)=>{

res.json(
trips.start(req.body)
);

}

);


module.exports=router;

`
);


// PILOT TEST

fs.writeFileSync(
"cablink_phase15_device_test.js",
`
const devices=require("./backend/mobile/device_registry");
const trips=require("./backend/trips/trip_manager");
const matcher=require("./backend/matching/driver_matcher");


console.log({

driverDevice:
devices.register({

device:"ANDROID_DRIVER_01",

user:"DRIVER001",

role:"DRIVER",

platform:"ANDROID"

}),


passengerDevice:
devices.register({

device:"ANDROID_PASSENGER_01",

user:"PASSENGER001",

role:"PASSENGER",

platform:"ANDROID"

}),


match:
matcher.find(
[
{
id:"DRIVER001",
online:true,
latitude:-24.628,
longitude:25.923
}
],
{
latitude:-24.630,
longitude:25.925
}
),


trip:
trips.start({

ride:"RIDE001",

driver:"DRIVER001",

passenger:"PASSENGER001"

})

});

`
);


console.log(`
=========================================

✅ PHASE 15 CREATED

Added:

✅ Device registration
✅ Driver matching
✅ Trip management
✅ Device heartbeat
✅ Mobile API foundation

NEXT:

Phase 16:
Real maps + GPS streaming + Android PWA testing

=========================================
`);

