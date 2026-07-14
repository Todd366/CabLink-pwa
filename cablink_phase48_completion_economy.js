const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 48
RIDE COMPLETION ECONOMY ENGINE
ARRIVE → COMPLETE → FARE → REWARD
=========================================
`);

[
"backend/services",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// SERVICE

fs.writeFileSync(
"backend/services/ride_completion_service.js",
`
const ledger=require("./economy_ledger_service");
const wallet=require("../rewards/wallet_service");


function completeRide(ride){

const completed={

...ride,

status:"COMPLETED",

completedAt:new Date().toISOString()

};


// calculate reward

const reward={

driver:ride.driver,

amount:1,

currency:"THB",

ride:ride.id

};


// wallet

if(wallet.add){

wallet.add(
ride.driver,
reward.amount
);

}


// ledger

ledger.recordRide(
completed
);

ledger.recordReward(
reward
);


return {

ride:completed,

fare:{

amount:ride.fare,

currency:"BWP"

},

reward

};

}


module.exports={
completeRide
};

`
);


// API

fs.writeFileSync(
"backend/routes/completion_api.js",
`
const router=require("express").Router();

const completion=
require("../services/ride_completion_service");


router.post(
"/ride/complete",
(req,res)=>{

res.json({

success:true,

result:
completion.completeRide(
req.body
)

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase48_completion_test.js",
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
"/api/ride/complete",
{

id:"RIDE-001",

driver:"DRIVER001",

passenger:"USER001",

fare:35

}

)
);


})();

`
);


console.log(`
=========================================

✅ PHASE 48 CREATED

Added:

✅ Ride completion service
✅ Fare recording
✅ THB reward trigger
✅ Wallet bridge
✅ Ledger bridge
✅ Completion API
✅ Test engine

NEXT:

Mount route
restart backend
test completion

=========================================
`);

