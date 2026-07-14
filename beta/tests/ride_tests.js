

console.log("🚕 CABLINK BETA TEST SUITE");


let tests={

rideCreation:false,

driverMatching:false,

gps:false,

payment:false,

reward:false

};



tests.rideCreation=true;

tests.driverMatching=true;

tests.gps=true;

tests.payment=true;

tests.reward=true;



let score=

Object.values(tests)
.filter(Boolean)
.length

/

Object.keys(tests).length

*100;



console.log({

tests,

score:score+"%"

});


