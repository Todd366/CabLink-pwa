const ride=require("./backend/rides/ride_engine");
const fare=require("./backend/fare/fare_engine");
const match=require("./backend/matching/matching_engine");
const auth=require("./backend/auth/auth_engine");
const settle=require("./backend/rides/settlement_engine");

console.log(`
=========================================
🚕 CABLINK REAL END TO END TEST
=========================================
`);

let user=auth.createUser({
role:"driver",
name:"Pilot Driver"
});

let driver=match.findDriver({
location:"Gaborone"
});

let rideData=ride.createRide({
passenger:"PASSENGER-001",
pickup:"Airport Junction",
destination:"CBD"
});

let price=fare.calculateFare({
distance:5
});


let settlement=settle.settle({

ride:rideData.id,

amount:price,

wallet:"0xPILOTWALLET",

reward:1

});


let result={
user,
driver,
ride:rideData,
fare:price,
settlement,
time:new Date().toISOString()
};


console.log(result);

require("fs").writeFileSync(
"REAL_END_TO_END_TEST_REPORT.json",
JSON.stringify(result,null,2)
);

