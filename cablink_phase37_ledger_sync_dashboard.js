const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 37
LEDGER STATUS SYNC + DRIVER ECONOMY
DASHBOARD INTELLIGENCE
=========================================
`);

fs.mkdirSync("backend/services",{recursive:true});
fs.mkdirSync("backend/routes",{recursive:true});
fs.mkdirSync("backend/testing",{recursive:true});


// UPDATE LEDGER SERVICE

const ledgerFile="backend/services/economy_ledger_service.js";

let ledger=fs.readFileSync(ledgerFile,"utf8");

if(!ledger.includes("updateRideStatus")){

ledger=ledger.replace(
"function driverHistory(driver){",

`
function updateRideStatus(id,status){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);

if(!ride) return null;

ride.status=status;

save(db);

return ride;

}


function driverEconomy(driver){

const db=load();

const rides=db.rides.filter(
r=>r.driver===driver
);

const transactions=db.transactions.filter(
t=>t.driver===driver
);

return {

driver,

rides:rides.length,

completed:
rides.filter(
r=>r.status==="COMPLETED"
).length,

totalFare:
rides.reduce(
(a,b)=>a+(b.fare||0),
0
),

thbEarned:
transactions.reduce(
(a,b)=>a+(b.amount||0),
0
),

transactions

};

}


function driverHistory(driver){
`
);


ledger=ledger.replace(
"driverHistory\n};",
`driverHistory,
updateRideStatus,
driverEconomy
};`
);

fs.writeFileSync(
ledgerFile,
ledger
);

console.log("✅ Ledger intelligence added");

}else{

console.log("ℹ️ Ledger already updated");

}



// DASHBOARD API

fs.writeFileSync(
"backend/routes/driver_economy_api.js",
`

const router=require("express").Router();

const ledger=require("../services/economy_ledger_service");


router.get(
"/driver/:id/economy",
(req,res)=>{

res.json(
ledger.driverEconomy(
req.params.id
)
);

});


module.exports=router;

`
);



// TEST

fs.writeFileSync(
"backend/testing/phase37_dashboard_test.js",
`

const http=require("http");


http.get(
"http://localhost:3000/api/driver/DRIVER001/economy",
res=>{

let data="";

res.on(
"data",
c=>data+=c
);

res.on(
"end",
()=>{

console.log(
JSON.parse(data)
);

});

});


`
);


console.log(`
=========================================

✅ PHASE 37 CREATED

Added:

✅ Ledger status updates
✅ Driver economy calculator
✅ THB earnings calculation
✅ Driver dashboard API
✅ Dashboard test

NEXT:

Mount driver economy route
restart backend
run test

=========================================
`);

