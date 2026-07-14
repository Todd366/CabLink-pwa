

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

