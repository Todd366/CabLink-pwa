const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 41
DRIVER LOCATION + SMART MATCHING ENGINE
ONLINE DRIVERS → NEARBY REQUESTS
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DRIVER LOCATION DATABASE

const file="backend/data/drivers_live.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
drivers:[]
},null,2)
);

}


// DRIVER LOCATION SERVICE

fs.writeFileSync(
"backend/services/driver_matching_service.js",
`

const fs=require("fs");

const file="backend/data/drivers_live.json";


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


// Driver goes online

function updateDriver(driver){

const db=load();

let existing=
db.drivers.find(
d=>d.id===driver.id
);


if(existing){

Object.assign(existing,driver);

}else{

db.drivers.push(driver);

}


save(db);

return driver;

}


// calculate rough distance

function distance(a,b){

const lat=
Math.abs(a.lat-b.lat);

const lng=
Math.abs(a.lng-b.lng);

return Number(
Math.sqrt(
lat*lat+lng*lng
).toFixed(2)
);

}


// find nearby drivers

function nearby(location){

const db=load();

return db.drivers
.filter(
d=>d.online===true
)
.map(
d=>({

...d,

distance:
distance(
d.location,
location
)

})
)
.sort(
(a,b)=>a.distance-b.distance
);

}


module.exports={
updateDriver,
nearby
};

`
);


// API

fs.writeFileSync(
"backend/routes/matching_api.js",
`

const router=require("express").Router();

const matching=
require("../services/driver_matching_service");


// driver online update

router.post(
"/driver/location",
(req,res)=>{

res.json({

success:true,

driver:
matching.updateDriver(
req.body
)

});

});


// find drivers

router.post(
"/matching/drivers",
(req,res)=>{

res.json({

drivers:
matching.nearby(
req.body.location
)

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase41_matching_test.js",
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
"/api/driver/location",
{
id:"DRIVER001",
online:true,
location:{
lat:-24.6282,
lng:25.9231
}
}
)
);


console.log(
await post(
"/api/matching/drivers",
{
location:{
lat:-24.6300,
lng:25.9250
}
}
)
);


})();

`
);


console.log(`
=========================================

✅ PHASE 41 CREATED

Added:

✅ Driver live registry
✅ Online/offline status
✅ Location storage
✅ Distance calculation
✅ Nearby driver matching
✅ Matching API
✅ Test engine

NEXT:

Mount route
restart backend
run matching test

=========================================
`);

