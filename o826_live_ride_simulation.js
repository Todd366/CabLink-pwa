const engine =
require("./backend/canonical/ride_engine");

const {STATES}=engine;

console.log(`
==============================================
CABLINK O.8.26 — LIVE RIDE SIMULATION
==============================================
`);

let ride =
engine.createRide({
 pickup:"BSTM HQ",
 dropoff:"Game City Mall",
 fare:20,
 passenger:"TEST_USER"
});

console.log("CREATED:",ride.status);


let steps=[
STATES.MATCHING,
STATES.DRIVER_ASSIGNED,
STATES.DRIVER_ARRIVED,
STATES.PICKED_UP,
STATES.STARTED,
STATES.COMPLETED
];


for(const step of steps){

let result =
engine.transition(
ride.id,
step,
{
driverId:"DRIVER-TEST-001",
driverName:"Pilot Driver"
}
);

console.log(
step,
result.success
?"PASS"
:"FAIL"
);

}


let final =
engine.getRide(ride.id);

console.log(`
FINAL STATE:
${final.status}
`);

console.log(`
==============================================
O.8.26 COMPLETE
==============================================
`);
