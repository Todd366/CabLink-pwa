const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 40
LIVE DEMAND INTELLIGENCE ENGINE
RIDE ACTIVITY → HOTSPOT SCORING
=========================================
`);

[
"backend/services",
"backend/routes",
"backend/data",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DEMAND DATABASE

const file="backend/data/live_demand.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
areas:[]
},null,2)
);

}


// DEMAND SERVICE

fs.writeFileSync(
"backend/services/live_demand_service.js",
`

const fs=require("fs");

const file=
"backend/data/live_demand.json";


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


// create demand event

function addRequest(location){

const db=load();


let area=
db.areas.find(
a=>a.location===location
);


if(!area){

area={
location,
activeRequests:0,
completedRequests:0,
score:0
};

db.areas.push(area);

}


area.activeRequests++;

calculate(area);

save(db);

return area;

}


// complete request

function completeRequest(location){

const db=load();


const area=
db.areas.find(
a=>a.location===location
);


if(area){

area.activeRequests=
Math.max(
0,
area.activeRequests-1
);

area.completedRequests++;

calculate(area);

save(db);

}


return area;

}


function calculate(area){

area.score=
Math.min(
100,
(area.activeRequests*10)
+
(area.completedRequests*2)
);

}


function hotspots(){

const db=load();

return db.areas.sort(
(a,b)=>b.score-a.score
);

}


module.exports={
addRequest,
completeRequest,
hotspots
};

`
);


// API

fs.writeFileSync(
"backend/routes/live_demand_api.js",
`

const router=require("express").Router();

const demand=
require("../services/live_demand_service");


// simulate incoming passenger

router.post(
"/demand/request",
(req,res)=>{

res.json({

success:true,

data:
demand.addRequest(
req.body.location
)

});

});


// complete ride

router.post(
"/demand/complete",
(req,res)=>{

res.json({

success:true,

data:
demand.completeRequest(
req.body.location
)

});

});


// driver hotspots

router.get(
"/driver/hotspots",
(req,res)=>{

res.json({

hotspots:
demand.hotspots()

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase40_demand_test.js",
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
"/api/demand/request",
{
location:"Gaborone CBD"
}
)
);


console.log(
await post(
"/api/demand/request",
{
location:"Airport"
}
)
);


console.log(
await post(
"/api/demand/request",
{
location:"Gaborone CBD"
}
)
);


http.get(
"http://localhost:3000/api/driver/hotspots",
res=>{

let d="";

res.on("data",c=>d+=c);

res.on("end",()=>{

console.log(
JSON.parse(d)
);

});

});


})();

`
);


console.log(`
=========================================

✅ PHASE 40 CREATED

Added:

✅ Live demand storage
✅ Passenger request events
✅ Ride completion events
✅ Demand scoring
✅ Driver hotspot API
✅ Test engine

NEXT:

Mount route
restart backend
test hotspots

=========================================
`);

