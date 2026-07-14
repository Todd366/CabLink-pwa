const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 39
DRIVER VISIBILITY + UPDATES CENTER
DEMAND MAP FOUNDATION
=========================================
`);

[
"backend/services",
"backend/routes",
"backend/data",
"frontend/services",
"frontend/components",
"frontend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DEMAND DATA

if(!fs.existsSync("backend/data/client_demand.json")){

fs.writeFileSync(
"backend/data/client_demand.json",
JSON.stringify({
requests:[
{
id:"REQ001",
location:"Gaborone CBD",
demand:8
},
{
id:"REQ002",
location:"Airport",
demand:5
}
]
},null,2)
);

}


// DEMAND SERVICE

fs.writeFileSync(
"backend/services/demand_service.js",
`

const fs=require("fs");

function getDemand(){

return JSON.parse(
fs.readFileSync(
"backend/data/client_demand.json",
"utf8"
)
);

}


module.exports={
getDemand
};

`
);


// DEMAND API

fs.writeFileSync(
"backend/routes/driver_demand_api.js",
`

const router=require("express").Router();

const demand=require("../services/demand_service");


router.get(
"/driver/demand",
(req,res)=>{

res.json(
demand.getDemand()
);

});


module.exports=router;

`
);


// UPDATES DATABASE

if(!fs.existsSync("backend/data/cablink_updates.json")){

fs.writeFileSync(
"backend/data/cablink_updates.json",
JSON.stringify([
{
version:"Phase 39",
title:"Driver Visibility Layer",
message:"Drivers can now view demand areas and system updates."
}
],null,2)
);

}


// UPDATE API

fs.writeFileSync(
"backend/routes/updates_api.js",
`

const router=require("express").Router();
const fs=require("fs");


router.get(
"/updates",
(req,res)=>{

res.json(
JSON.parse(
fs.readFileSync(
"backend/data/cablink_updates.json",
"utf8"
)
)
);

});


module.exports=router;

`
);


// FRONTEND CONNECTORS

fs.writeFileSync(
"frontend/services/demand_api.js",
`

async function getDemand(){

const r=await fetch(
"/api/driver/demand"
);

return r.json();

}

module.exports={getDemand};

`
);


fs.writeFileSync(
"frontend/services/updates_api.js",
`

async function getUpdates(){

const r=await fetch(
"/api/updates"
);

return r.json();

}

module.exports={getUpdates};

`
);


// UI COMPONENTS

fs.writeFileSync(
"frontend/components/driver_demand_map.js",
`

function render(data){

return {

screen:"Driver Demand Map",

areas:data.requests,

status:"LIVE"

};

}

module.exports={render};

`
);


fs.writeFileSync(
"frontend/components/updates_center.js",
`

function render(data){

return {

screen:"CabLink Updates",

updates:data

};

}

module.exports={render};

`
);


console.log(`
=========================================

✅ PHASE 39 CREATED

Added:

✅ Driver demand API
✅ Client density data layer
✅ Updates database
✅ Updates API
✅ Frontend connectors
✅ UI foundations

NEXT:
Mount routes into server.js

=========================================
`);

