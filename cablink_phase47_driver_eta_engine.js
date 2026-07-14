const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 47
DRIVER MOVEMENT + ETA ENGINE
GPS → DISTANCE → ARRIVAL TIME
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


// DRIVER LOCATION DATABASE

const file="backend/data/driver_positions.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
positions:[]
},null,2)
);

}


// LOCATION SERVICE

fs.writeFileSync(
"backend/services/driver_location_service.js",
`

const fs=require("fs");

const file=
"backend/data/driver_positions.json";


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


// update driver GPS

function update(driver){

const db=load();

let existing=
db.positions.find(
p=>p.driver===driver.driver
);


if(existing){

Object.assign(existing,driver);

}else{

db.positions.push(driver);

}


save(db);

return driver;

}


// distance approximation

function distance(a,b){

const lat=
Math.abs(a.lat-b.lat);

const lng=
Math.abs(a.lng-b.lng);


return Number(
(Math.sqrt(lat*lat+lng*lng)*111)
.toFixed(2)
);

}


// ETA minutes

function eta(km){

return Math.max(
1,
Math.ceil(km/0.5)
);

}



function track(driver){

const db=load();

return db.positions.find(
p=>p.driver===driver
);

}


function calculate(driver,pickup){

const position=track(driver);

if(!position)
return null;


const km=
distance(
position.location,
pickup
);


return {

driver,

distanceKm:km,

etaMinutes:
eta(km)

};

}


module.exports={
update,
calculate
};

`
);


// API

fs.writeFileSync(
"backend/routes/driver_location_api.js",
`

const router=require("express").Router();

const location=
require("../services/driver_location_service");


// driver sends GPS

router.post(
"/driver/location/update",
(req,res)=>{

res.json({

success:true,

location:
location.update(req.body)

});

});


// passenger tracking

router.post(
"/ride/tracking",
(req,res)=>{

res.json({

success:true,

tracking:
location.calculate(
req.body.driver,
req.body.pickup
)

});

});


module.exports=router;

`
);


// FRONTEND CONNECTOR

fs.writeFileSync(
"frontend/services/tracking_api.js",
`

async function trackRide(driver,pickup){

const r=
await fetch(
"/api/ride/tracking",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
driver,
pickup
})

}

);

return r.json();

}


module.exports={
trackRide
};

`
);


// UI

fs.writeFileSync(
"frontend/components/driver_tracking_card.jsx",
`

export default function DriverTrackingCard({data}){

return (

<div>

<h2>
📍 Driver Tracking
</h2>

<p>
Distance:
{data.distanceKm} km
</p>

<p>
ETA:
{data.etaMinutes} minutes
</p>

</div>

);

}

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase47_eta_test.js",
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


console.log(
await post(
"/api/driver/location/update",
{
driver:"DRIVER001",

location:{
lat:-24.6282,
lng:25.9231
}

}
)
);


console.log(
await post(
"/api/ride/tracking",
{

driver:"DRIVER001",

pickup:{
lat:-24.6300,
lng:25.9250
}

}
)
);


})();

