const auth=require("./backend/auth/auth_engine");
const ride=require("./backend/rides/ride_engine");
const fare=require("./backend/fare/fare_engine");
const match=require("./backend/matching/matching_engine");
const settle=require("./backend/rides/settlement_engine");

const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REAL END TO END TEST v4
=========================================
`);


// AUTH

const passenger=auth.register({
name:"Pilot Passenger",
role:"passenger"
});


const driver=auth.register({
name:"Pilot Driver",
role:"driver"
});


// DRIVER POOL

const availableDrivers=[

{
id:driver.id,
online:true,
distance:1,
location:"Gaborone"
}

];


// REQUEST RIDE

const requestedRide=ride.requestRide({

passenger:passenger.id,

pickup:"Airport Junction",

destination:"CBD"

});


// MATCH DRIVER

const matchedDriver=match.findDriver(
availableDrivers,
passenger
);


// ASSIGN DRIVER USING RIDE ID

const assignedRide=ride.assignDriver(
requestedRide.id,
matchedDriver
);


// CALCULATE FARE

const fareAmount=fare.calculate(
5,
15
);


// COMPLETE USING RIDE ID

const completedRide=ride.completeRide(
assignedRide.id
);


// SETTLEMENT

const settlement=settle.settle({

ride:completedRide.id,

amount:fareAmount,

wallet:"PILOT-WALLET",

reward:1

});


// REPORT

const report={

passenger,

driver,

matchedDriver,

requestedRide,

assignedRide,

fareAmount,

completedRide,

settlement,

timestamp:new Date().toISOString()

};


fs.writeFileSync(
"REAL_END_TO_END_TEST_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);


console.log(`
=========================================

✅ CABLINK REAL FLOW COMPLETED

=========================================
`);

