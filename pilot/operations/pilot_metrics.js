
const store=require("../../database/production/store_engine");


function metrics(){

let rides=store.get("rides");
let rewards=store.get("rewards");
let users=store.get("users");


let drivers=
users.filter(
x=>x.role==="driver"
);


let passengers=
users.filter(
x=>x.role==="passenger"
);


let completed=
rides.filter(
x=>x.status==="COMPLETED"
);


return {

pilot:"CabLink",

users:users.length,

drivers:drivers.length,

passengers:passengers.length,

rides:rides.length,

completedRides:completed.length,

rewardIssued:
rewards.reduce(
(a,b)=>a+(b.amount||0),
0
),

timestamp:new Date().toISOString()

};

}


console.log(metrics());


module.exports={
metrics
};

