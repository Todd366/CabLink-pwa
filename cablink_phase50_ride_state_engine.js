const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 50
LIVE RIDE CONTROL CENTER
RIDE STATE MACHINE
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing",
"frontend/services",
"frontend/components"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DATABASE

const file="backend/data/live_rides.json";

if(!fs.existsSync(file)){
fs.writeFileSync(
file,
JSON.stringify({rides:[]},null,2)
);
}


// SERVICE

fs.writeFileSync(
"backend/services/ride_state_service.js",
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


function create(ride){

const db=load();

const item={
id:"RIDE-"+Date.now(),
...ride,
status:"SEARCHING",
created:new Date().toISOString()
};

db.rides.push(item);

save(db);

return item;

}


function update(id,status){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);

if(ride){

ride.status=status;
ride.updated=new Date().toISOString();

save(db);

}

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
get
};

`
);


// API

fs.writeFileSync(
"backend/routes/ride_state_api.js",
`

const router=require("express").Router();

const state=
require("../services/ride_state_service");


router.post(
"/ride/create",
(req,res)=>{

res.json({
success:true,
ride:
state.create(req.body)
});

});


router.post(
"/ride/status",
(req,res)=>{

res.json({
success:true,
ride:
state.update(
req.body.id,
req.body.status
)
});

});


router.get(
"/ride/:id/status",
(req,res)=>{

res.json({
ride:
state.get(req.params.id)
});

});


module.exports=router;

`
);


// FRONTEND CONNECTOR

fs.writeFileSync(
"frontend/services/ride_state_api.js",
`

async function status(id){

const r=await fetch(
"/api/ride/"+id+"/status"
);

return r.json();

}

module.exports={status};

`
);


// UI

fs.writeFileSync(
"frontend/components/live_ride_card.jsx",
`

export default function LiveRideCard({ride}){

return (

<div>

<h2>🚕 Live Ride</h2>

<p>
Status:
{ride.status}
</p>

<p>
Pickup:
{ride.pickup}
</p>

<p>
Destination:
{ride.destination}
</p>

</div>

);

}

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase50_state_test.js",
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

console.log(
"CREATED",
ride
);


console.log(
await post(
"/api/ride/status",
{
id:ride.ride.id,
status:"DRIVER_ARRIVING"
}
)
);


console.log(
await post(
"/api/ride/status",
{
id:ride.ride.id,
status:"TRIP_STARTED"
}
)
);


})();

