const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 47 FIX
DRIVER ETA ENGINE REPAIR
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


// SERVICE

fs.writeFileSync(
"backend/services/driver_location_service.js",
`
const fs=require("fs");

const file="backend/data/driver_positions.json";

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


function update(driver){

const db=load();

let item=db.positions.find(
p=>p.driver===driver.driver
);


if(item){

Object.assign(item,driver);

}else{

db.positions.push(driver);

}

save(db);

return driver;

}


function distance(a,b){

const lat=Math.abs(a.lat-b.lat);
const lng=Math.abs(a.lng-b.lng);

return Number(
(Math.sqrt(lat*lat+lng*lng)*111)
.toFixed(2)
);

}


function calculate(driver,pickup){

const db=load();

const item=db.positions.find(
p=>p.driver===driver
);


if(!item) return null;


const km=distance(
item.location,
pickup
);


return {

driver,

distanceKm:km,

etaMinutes:Math.max(
1,
Math.ceil(km/0.5)
)

};

}


module.exports={
update,
calculate
};

`
);


// DATA

if(!fs.existsSync("backend/data/driver_positions.json")){

fs.writeFileSync(
"backend/data/driver_positions.json",
JSON.stringify({
positions:[]
},null,2)
);

}


// ROUTE

fs.writeFileSync(
"backend/routes/driver_location_api.js",
`
const router=require("express").Router();

const location=
require("../services/driver_location_service");


router.post(
"/driver/location/update",
(req,res)=>{

res.json({
success:true,
location:
location.update(req.body)
});

});


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
`
);


console.log(`
=========================================

✅ PHASE 47 REPAIRED

Run:

pkill -f "node backend/server.js"

npm run backend

node backend/testing/phase47_eta_test.js

=========================================
`);

