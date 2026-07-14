

(function(){

"use strict";


window.CABLINK_SIM={


run:function(){

console.log("🚕 Starting CabLink ride simulation");


let ride=
window.CABLINK_RIDE.create({

customer:"TEST_USER",

pickup:"Gaborone Mall",

dropoff:"Airport",

vehicle:"standard",

fare:68

});


console.log("1️⃣ Ride Created",ride);



let driver={
id:"DRV001",
name:"Demo Driver",
vehicle:"Toyota Corolla"
};



let match=
window.CABLINK_OPS.dispatch(
ride,
[driver]
);


console.log("2️⃣ Driver Match",match);



if(match.success){

window.CABLINK_RIDE.update(
ride,
"DRIVER_ACCEPTED"
);

}


console.log("3️⃣ Ride Status",ride.status);



window.CABLINK_RIDE.update(
ride,
"TRIP_ACTIVE"
);


console.log("4️⃣ Trip Started");



window.CABLINK_RIDE.update(
ride,
"TRIP_COMPLETE"
);


let payment=
window.CABLINK_FINANCE.calculate(
ride.fare
);


console.log("5️⃣ Payment",payment);



window.CABLINK_RIDE.update(
ride,
"REWARD_SENT"
);


console.log("6️⃣ Final Ride",ride);



return {

ride:ride,

payment:payment

};


}


};


console.log("🚕 Simulation Engine Ready");


})();
