const engine =
require("./backend/canonical/ride_engine");

console.log(`
==============================================
CABLINK O.8.28 — DRIVER ACCEPTANCE RACE TEST
==============================================
`);

async function run(){

let ride =
engine.createRide({
 pickup:"BSTM HQ",
 dropoff:"Game City Mall",
 fare:20,
 passenger:"RACE_TEST"
});


engine.transition(
 ride.id,
 engine.STATES.MATCHING
);


console.log(
"INITIAL:",
engine.getRide(ride.id).status
);


let driverA =
await engine.acceptRide(
 ride.id,
 "DRIVER-A",
 "Driver A"
);


console.log(
"DRIVER A:",
driverA.success
?"PASS"
:"FAIL"
);


let driverB =
await engine.acceptRide(
 ride.id,
 "DRIVER-B",
 "Driver B"
);


console.log(
"DRIVER B:",
driverB.success
?"UNEXPECTED PASS"
:"BLOCKED"
);


console.log(`
FINAL:
`);

console.log(
engine.getRide(ride.id)
);


console.log(`
==============================================
O.8.28 COMPLETE
==============================================
`);

}

run();
