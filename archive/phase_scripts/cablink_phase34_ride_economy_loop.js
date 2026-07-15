const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 34
RIDE ECONOMY LOOP ENGINE
ACCEPT → COMPLETE → REWARD → WALLET
=========================================
`);

fs.mkdirSync("backend/services",{recursive:true});
fs.mkdirSync("backend/routes",{recursive:true});
fs.mkdirSync("backend/testing",{recursive:true});


// RIDE ECONOMY SERVICE

fs.writeFileSync(
"backend/services/ride_economy_service.js",
`

const wallet=require("../rewards/wallet_service");
const history=require("../rewards/reward_history");


let rides=[];


function accept(driver,ride){

const record={
id:"RIDE-"+Date.now(),
driver,
status:"ACCEPTED",
fare:ride.fare || 20,
created:new Date().toISOString()
};

rides.push(record);

return record;

}


function complete(id){

const ride=
rides.find(r=>r.id===id);

if(!ride) return null;


ride.status="COMPLETED";


const reward={
driver:ride.driver,
amount:1,
currency:"THB",
ride:id,
time:new Date().toISOString()
};


// wallet update
if(wallet.add){
wallet.add(
ride.driver,
1
);
}


// history update
if(history.add){
history.add(reward);
}


return {
ride,
reward
};

}


function list(){
return rides;
}


module.exports={
accept,
complete,
list
};

`
);


// API ROUTE

fs.writeFileSync(
"backend/routes/ride_economy_api.js",
`

const router=require("express").Router();

const economy=require("../services/ride_economy_service");


router.post(
"/economy/ride/accept",
(req,res)=>{

res.json({

success:true,

ride:
economy.accept(
req.body.driver,
req.body.ride || {}
)

});

});


router.post(
"/economy/ride/complete",
(req,res)=>{

res.json({

success:true,

result:
economy.complete(
req.body.id
)

});

});


router.get(
"/economy/rides",
(req,res)=>{

res.json({

success:true,

rides:economy.list()

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase34_economy_test.js",
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

let accepted=
await post(
"/api/economy/ride/accept",
{
driver:"DRIVER001",
ride:{
fare:25
}
}
);


console.log("ACCEPTED:");
console.log(accepted);


let completed=
await post(
"/api/economy/ride/complete",
{
id:accepted.ride.id
}
);


console.log("COMPLETED:");
console.log(completed);


})();

`
);


console.log(`
=========================================

✅ PHASE 34 CREATED

Added:

✅ Ride acceptance engine
✅ Ride completion engine
✅ THB reward trigger
✅ Wallet update hook
✅ Economy API routes
✅ Live test

NEXT:

Mount route in server.js

=========================================
`);

