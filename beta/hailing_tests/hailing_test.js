

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

