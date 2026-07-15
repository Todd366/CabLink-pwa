const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 35
PERSISTENT ECONOMY LEDGER
RIDE HISTORY + REWARD AUDIT
=========================================
`);

fs.mkdirSync("backend/data",{recursive:true});
fs.mkdirSync("backend/services",{recursive:true});
fs.mkdirSync("backend/testing",{recursive:true});


// DATABASE FILE

const db="backend/data/economy_ledger.json";

if(!fs.existsSync(db)){
fs.writeFileSync(
db,
JSON.stringify({
rides:[],
transactions:[]
},null,2)
);
}


// LEDGER SERVICE

fs.writeFileSync(
"backend/services/economy_ledger_service.js",
`

const fs=require("fs");

const file="backend/data/economy_ledger.json";


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


function recordRide(ride){

const db=load();

db.rides.push(ride);

save(db);

return ride;

}


function recordReward(reward){

const db=load();

const tx={

id:"TX-"+Date.now(),

type:"THB_REWARD",

...reward,

created:new Date().toISOString()

};


db.transactions.push(tx);

save(db);

return tx;

}


function driverHistory(driver){

const db=load();

return {

rides:
db.rides.filter(
r=>r.driver===driver
),

transactions:
db.transactions.filter(
t=>t.driver===driver
)

};

}


module.exports={
recordRide,
recordReward,
driverHistory
};

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase35_ledger_test.js",
`

const ledger=
require("../services/economy_ledger_service");


const ride={

id:"RIDE-"+Date.now(),

driver:"DRIVER001",

fare:30,

status:"COMPLETED"

};


console.log(
"RIDE LEDGER:"
);

console.log(
ledger.recordRide(ride)
);


console.log(
"REWARD LEDGER:"
);


console.log(

ledger.recordReward({

driver:"DRIVER001",

amount:1,

currency:"THB",

ride:ride.id

})

);


console.log(
"DRIVER HISTORY:"
);


console.log(
ledger.driverHistory(
"DRIVER001"
)
);

`
);


console.log(`
=========================================

✅ PHASE 35 CREATED

Added:

✅ Persistent ledger storage
✅ Ride history records
✅ THB transaction records
✅ Driver history lookup

RUN:

node backend/testing/phase35_ledger_test.js

NEXT:

Connect Phase 34 reward engine
to this permanent ledger

=========================================
`);

