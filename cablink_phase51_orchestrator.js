const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 51
REAL-TIME RIDE ORCHESTRATOR
AUTOMATIC LIFECYCLE CONTROL
=========================================
`);

[
"backend/services",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// ORCHESTRATOR SERVICE

fs.writeFileSync(
"backend/services/ride_orchestrator_service.js",
`

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

`
);


// API

fs.writeFileSync(
"backend/routes/orchestrator_api.js",
`

const router=require("express").Router();

const engine=
require("../services/ride_orchestrator_service");



router.post(
"/orchestrator/create",
(req,res)=>{

res.json({

success:true,

ride:
engine.createRide(req.body)

});

});



router.post(
"/orchestrator/assign",
(req,res)=>{

res.json({

success:true,

ride:
engine.assignDriver(
req.body.id,
req.body.driver
)

});

});



router.post(
"/orchestrator/arrived",
(req,res)=>{

res.json({

success:true,

ride:
engine.driverArrived(
req.body.id
)

});

});



router.post(
"/orchestrator/start",
(req,res)=>{

res.json({

success:true,

ride:
engine.startTrip(
req.body.id
)

});

});



router.post(
"/orchestrator/finish",
(req,res)=>{

res.json({

success:true,

result:
engine.finishTrip(
req.body.id,
req.body.fare
)

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase51_orchestrator_test.js",
`

const http=require("http");


function post(path,data){

return new Promise(resolve=>{

const req=http.request({

hostname:"localhost",
port:3000,
path,
method:"POST",
headers:{
"Content-Type":"application/json"
}

},res=>{

let body="";

res.on("data",c=>body+=c);

res.on("end",()=>resolve(JSON.parse(body)));

});


req.write(JSON.stringify(data));

req.end();

});

}


(async()=>{


let ride=
await post(
"/api/orchestrator/create",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);


console.log(
"CREATED",
ride
);


let id=ride.ride.id;


console.log(
await post(
"/api/orchestrator/assign",
{
id,
driver:"DRIVER001"
}
)
);



console.log(
await post(
"/api/orchestrator/arrived",
{id}
)
);



console.log(
await post(
"/api/orchestrator/start",
{id}
)
);



console.log(
await post(
"/api/orchestrator/finish",
{
id,
fare:35
}
)
);



})();

`
);


console.log(`
=========================================

✅ PHASE 51 CREATED

Added:

✅ Ride orchestrator service
✅ Automatic lifecycle control
✅ Driver assignment automation
✅ Arrival events
✅ Trip start events
✅ Completion trigger
✅ Economy bridge
✅ Notification bridge

NEXT:

Mount route
restart backend
run test

=========================================
`);

