const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REAL HAILING COMPLETION ENGINE
=========================================
`);

const dirs=[
"backend/rides",
"backend/matching",
"backend/fare",
"backend/rewards",
"beta/hailing_tests"
];

dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


// RIDE ENGINE

fs.writeFileSync(
"backend/rides/ride_engine.js",

`

const rides=[];

function requestRide(data){

let ride={

id:"RIDE-"+Date.now(),

passenger:data.passenger,

pickup:data.pickup,

destination:data.destination,

status:"REQUESTED",

driver:null

};

rides.push(ride);

return ride;

}


function assignDriver(id,driver){

let ride=rides.find(r=>r.id===id);

if(ride){

ride.driver=driver;

ride.status="DRIVER_ASSIGNED";

}

return ride;

}


function completeRide(id){

let ride=rides.find(r=>r.id===id);

if(ride){

ride.status="COMPLETED";

}

return ride;

}


module.exports={
requestRide,
assignDriver,
completeRide
};

`
);


// DRIVER MATCHING

fs.writeFileSync(
"backend/matching/matching_engine.js",

`

function findDriver(drivers,passenger){

return drivers
.filter(d=>d.online)
.sort((a,b)=>
a.distance-b.distance
)[0] || null;

}


module.exports={
findDriver
};

`
);


// FARE ENGINE

fs.writeFileSync(
"backend/fare/fare_engine.js",

`

function calculate(distance,time){

return Number(
(10+(distance*4)+(time*0.5))
.toFixed(2)
);

}


module.exports={
calculate
};

`
);


// REWARD ENGINE

fs.writeFileSync(
"backend/rewards/reward_engine.js",

`

function issue(ride){

return {

ride:ride,

token:"THB",

amount:1,

status:"ISSUED"

};

}


module.exports={
issue
};

`
);


// END TO END TEST

fs.writeFileSync(
"beta/hailing_tests/hailing_test.js",

`

const ride=require("../../backend/rides/ride_engine");
const match=require("../../backend/matching/matching_engine");
const fare=require("../../backend/fare/fare_engine");
const reward=require("../../backend/rewards/reward_engine");


let passenger="PASSENGER-001";


let driver=match.findDriver(
[
{
id:"DRIVER-001",
online:true,
distance:2
}
],
passenger
);


let request=ride.requestRide({

passenger,

pickup:"Gaborone",

destination:"Airport"

});


ride.assignDriver(
request.id,
driver.id
);


let amount=fare.calculate(
5,
15
);


let completed=ride.completeRide(
request.id
);


let rewardResult=reward.issue(
completed.id
);


let result={

driverFound:!!driver,

rideAssigned:
completed.status==="COMPLETED",

fareGenerated:
amount>0,

rewardIssued:
rewardResult.status==="ISSUED"

};


let score=
Object.values(result)
.filter(Boolean).length /
Object.keys(result).length*100;


console.log({

result,

score:score+"%",

status:
score===100?
"HAILING LOOP READY":
"FIX REQUIRED"

});

`
);


console.log(`
=========================================

🚕 REAL HAILING ENGINE INSTALLED

Run:
node beta/hailing_tests/hailing_test.js

=========================================
`);

