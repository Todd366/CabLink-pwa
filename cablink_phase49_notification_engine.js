const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 49
RIDE EVENTS + NOTIFICATION CENTER
SYSTEM ACTIVITY TIMELINE
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing",
"frontend/components",
"frontend/services"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// EVENT DATABASE

const file="backend/data/ride_events.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
events:[]
},null,2)
);

}


// EVENT SERVICE

fs.writeFileSync(
"backend/services/ride_event_service.js",
`
const fs=require("fs");

const file="backend/data/ride_events.json";


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


function add(event){

const db=load();

const item={

id:"EVENT-"+Date.now(),

...event,

time:new Date().toISOString()

};


db.events.push(item);

save(db);

return item;

}


function history(ride){

const db=load();

return db.events.filter(
e=>e.ride===ride
);

}


module.exports={
add,
history
};

`
);


// NOTIFICATION SERVICE

fs.writeFileSync(
"backend/services/notification_service.js",
`
const events=
require("./ride_event_service");


function notify(data){

return events.add({

user:data.user,

driver:data.driver,

ride:data.ride,

type:data.type,

message:data.message

});

}


module.exports={
notify
};

`
);


// API

fs.writeFileSync(
"backend/routes/notification_api.js",
`
const router=require("express").Router();

const notification=
require("../services/notification_service");

const events=
require("../services/ride_event_service");


router.post(
"/notifications/create",
(req,res)=>{

res.json({

success:true,

notification:
notification.notify(req.body)

});

});


router.get(
"/ride/:id/timeline",
(req,res)=>{

res.json({

events:
events.history(
req.params.id
)

});

});


module.exports=router;

`
);


// FRONTEND CONNECTOR

fs.writeFileSync(
"frontend/services/notification_api.js",
`
async function getTimeline(id){

const r=await fetch(
"/api/ride/"+id+"/timeline"
);

return r.json();

}


module.exports={
getTimeline
};

`
);


// UI TIMELINE

fs.writeFileSync(
"frontend/components/ride_timeline.jsx",
`
export default function RideTimeline({events}){

return (

<div>

<h2>
🚕 Ride Timeline
</h2>

{
events.map(
(e,i)=>(

<div key={i}>

<h3>
{e.type}
</h3>

<p>
{e.message}
</p>

</div>

)
)

}

</div>

);

}

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase49_notification_test.js",
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
"/api/notifications/create",
{
ride:"RIDE-001",
user:"USER001",
driver:"DRIVER001",
type:"DRIVER_ARRIVED",
message:"Your driver has arrived"
}
)
);


let req=http.get(
"http://localhost:3000/api/ride/RIDE-001/timeline",
res=>{

let d="";

res.on("data",c=>d+=c);

res.on("end",()=>console.log(JSON.parse(d)));

});

})();
`
);


console.log(`
=========================================

✅ PHASE 49 CREATED

Added:

✅ Ride event database
✅ Notification service
✅ Timeline API
✅ Frontend timeline component
✅ Notification connector
✅ Test engine

NEXT:

Mount route
restart backend
test notifications

=========================================
`);

