const engine =
require("./backend/canonical/ride_engine");

const reward =
require("./backend/services/canonical_reward_service");

console.log(`
==============================================
CABLINK O.8.29 — FULL ECONOMY RIDE TEST
==============================================
`);

async function run(){

let ride =
engine.createRide({
 pickup:"BSTM HQ",
 dropoff:"Game City Mall",
 fare:20,
 passenger:"ECONOMY_TEST"
});

console.log("CREATED:", ride.status);


engine.transition(
 ride.id,
 engine.STATES.MATCHING
);

console.log(
"MATCHING:",
engine.getRide(ride.id).status
);


let accepted =
await engine.acceptRide(
 ride.id,
 "DRIVER-ECON-001",
 "Economy Driver"
);

console.log(
"DRIVER ASSIGN:",
accepted.success ? "PASS" : "FAIL"
);


for(const state of [
 engine.STATES.DRIVER_ARRIVED,
 engine.STATES.PICKED_UP,
 engine.STATES.STARTED,
 engine.STATES.COMPLETED
]){

let result =
engine.transition(
 ride.id,
 state,
 {
  driverId:"DRIVER-ECON-001"
 }
);

console.log(
state,
result.success ? "PASS" : "FAIL"
);

}


let completed =
engine.getRide(ride.id);

console.log(
"FINAL RIDE:",
completed.status
);


let firstReward =
reward.createRewardForCompletedRide(
 ride.id
);

console.log(
"FIRST REWARD:",
firstReward.status
);


let secondReward =
reward.createRewardForCompletedRide(
 ride.id
);

console.log(
"SECOND REWARD:",
secondReward.status
);


console.log(`
==============================================
O.8.29 COMPLETE
==============================================
`);

}

run();
