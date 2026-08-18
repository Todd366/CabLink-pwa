

const fs=require("fs");
const path=require("path");

const file=path.join(__dirname,"..","data","economy_ledger.json");


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



function updateRideStatus(id,status){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);

if(!ride) return null;

console.warn("[CABLINK] Legacy status mutation blocked");

save(db);

return ride;

}


function driverEconomy(driver){

const db=load();

const rides=db.rides.filter(
r=>(
    r.driverId===driver ||
    r.driver===driver
)
);

const transactions=db.transactions.filter(
t=>(
    t.driverId===driver ||
    t.driver===driver
)
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


const db=load();

return {

rides:
db.rides.filter(
r=>(
    r.driverId===driver ||
    r.driver===driver
)
),

transactions:
db.transactions.filter(
t=>(
    t.driverId===driver ||
    t.driver===driver
)
)

};

}


module.exports={
recordRide,
recordReward,
driverHistory,
updateRideStatus,
driverEconomy
};

