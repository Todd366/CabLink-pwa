const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 46
LIVE RIDE STATE ENGINE
REQUEST → MATCH → ACCEPT → COMPLETE
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing",
"frontend/services",
"frontend/components",
"frontend/pages"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DATABASE

const file="backend/data/live_rides.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
rides:[]
},null,2)
);

}


// SERVICE

fs.writeFileSync(
"backend/services/live_ride_service.js",
`

const fs=require("fs");

const file="backend/data/live_rides.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function save(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


function create(data){

const db=load();

const ride={

id:"RIDE-"+Date.now(),

passenger:data.passenger,

driver:null,

pickup:data.pickup,

destination:data.destination,

status:"SEARCHING",

created:new Date().toISOString()

};


db.rides.push(ride);

save(db);

return ride;

}



function update(id,status){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);


if(!ride) return null;


ride.status=status;

ride.updated=
new Date().toISOString();


save(db);

return ride;

}



function assignDriver(id,driver){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);


if(!ride) return null;


ride.driver=driver;

ride.status="DRIVER_FOUND";

save(db);

return ride;

}



function get(id){

const db=load();

return db.rides.find(
r=>r.id===id
);

}


module.exports={
create,
update,
assignDriver,
get
};

`
);


// API

fs.writeFileSync(
"backend/routes/live_ride_api.js",
`

const router=require("express").Router();

const rides=
require("../services/live_ride_service");


// create passenger ride

router.post(
"/ride/create",
(req,res)=>{

res.json({

success:true,

ride:
rides.create(req.body)

});

});


// update state

router.post(
"/ride/status",
(req,res)=>{

res.json({

success:true,

ride:
rides.update(
req.body.id,
req.body.status
)

});

});


// driver accepts

router.post(
"/ride/assign",
(req,res)=>{

res.json({

success:true,

ride:
rides.assignDriver(
req.body.id,
req.body.driver
)

});

});


// get live ride

router.get(
"/ride/:id",
(req,res)=>{

res.json(
rides.get(
req.params.id
)
);

});


module.exports=router;

`
);


// FRONTEND CONNECTOR

fs.writeFileSync(
"frontend/services/live_ride_api.js",
`

async function getRide(id){

const r=
await fetch(
"/api/ride/"+id
);

return r.json();

}


async function updateRide(id,status){

const r=
await fetch(
"/api/ride/status",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
id,
status
})

}

);

return r.json();

}


module.exports={
getRide,
updateRide
};

`
);


// UI COMPONENT

fs.writeFileSync(
"frontend/components/ride_status_card.jsx",
`

export default function RideStatusCard({ride}){


return (

<div>

<h2>
🚕 Ride Status
</h2>

<p>
ID: {ride.id}
</p>

<p>
Status: {ride.status}
</p>

<p>
Driver:
{ride.driver || "Searching"}
</p>

</div>

);

}

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase46_live_test.js",
`

const http=require("http");


function post(path,data){

return new Promise(resolve=>{

const req=http.request(
{
hostname:"localhost",
port:3000,
path,
method:"POST",
headers:{
"Content-Type":"application/json"
}
},
res=>{

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
"/api/ride/create",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);


console.log("CREATED");
console.log(ride);


let assigned=
await post(
"/api/ride/assign",
{
id:ride.ride.id,
driver:"DRIVER001"
}
);


console.log("ASSIGNED");
console.log(assigned);



let accepted=
await post(
"/api/ride/status",
{
id:ride.ride.id,
status:"ACCEPTED"
}
);


console.log("STATUS");
console.log(accepted);


})();

`
);


console.log(`
=========================================

✅ PHASE 46 CREATED

Added:

✅ Live ride database
✅ Ride status engine
✅ Passenger tracking API
✅ Driver status API
✅ Frontend connector
✅ Ride status component

NEXT:

Mount route
restart backend
run test

=========================================
`);

