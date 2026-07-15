const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 42
SMART DISPATCH ENGINE
REQUEST → MATCH → ACCEPT
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DISPATCH DATABASE

const file="backend/data/dispatch_requests.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
requests:[]
},null,2)
);

}


// DISPATCH SERVICE

fs.writeFileSync(
"backend/services/dispatch_service.js",
`

const fs=require("fs");

const file="backend/data/dispatch_requests.json";


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


// create passenger request

function createRequest(data){

const db=load();

const request={

id:"REQ-"+Date.now(),

passenger:data.passenger || "USER001",

pickup:data.pickup,

destination:data.destination,

status:"SEARCHING",

drivers:[],

created:new Date().toISOString()

};


db.requests.push(request);

save(db);

return request;

}


// attach matched drivers

function dispatch(id,drivers){

const db=load();

const request=
db.requests.find(
r=>r.id===id
);

if(!request) return null;


request.drivers=drivers;

request.status="DRIVER_FOUND";

save(db);

return request;

}


// driver accepts

function accept(id,driver){

const db=load();

const request=
db.requests.find(
r=>r.id===id
);

if(!request) return null;


request.driver=driver;

request.status="ACCEPTED";

request.acceptedAt=
new Date().toISOString();


save(db);

return request;

}


function list(){

return load().requests;

}


module.exports={
createRequest,
dispatch,
accept,
list
};

`
);


// API

fs.writeFileSync(
"backend/routes/dispatch_api.js",
`

const router=require("express").Router();

const dispatch=
require("../services/dispatch_service");


// passenger creates ride

router.post(
"/dispatch/request",
(req,res)=>{

res.json({

success:true,

request:
dispatch.createRequest(
req.body
)

});

});


// attach drivers

router.post(
"/dispatch/match",
(req,res)=>{

res.json({

success:true,

request:
dispatch.dispatch(
req.body.id,
req.body.drivers
)

});

});


// driver accepts

router.post(
"/dispatch/accept",
(req,res)=>{

res.json({

success:true,

request:
dispatch.accept(
req.body.id,
req.body.driver
)

});

});


// history

router.get(
"/dispatch/list",
(req,res)=>{

res.json(
dispatch.list()
);

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase42_dispatch_test.js",
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
"/api/dispatch/request",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);


console.log("REQUEST:");
console.log(ride);


let matched=
await post(
"/api/dispatch/match",
{
id:ride.request.id,
drivers:[
{
id:"DRIVER001",
distance:0.5
}
]
}
);


console.log("MATCHED:");
console.log(matched);


let accepted=
await post(
"/api/dispatch/accept",
{
id:ride.request.id,
driver:"DRIVER001"
}
);


console.log("ACCEPTED:");
console.log(accepted);


})();

`
);


console.log(`
=========================================

✅ PHASE 42 CREATED

Added:

✅ Passenger dispatch requests
✅ Driver assignment
✅ Driver acceptance
✅ Dispatch history
✅ API layer
✅ Test engine

NEXT:

Mount route
restart backend
run test

=========================================
`);

