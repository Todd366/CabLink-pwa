

(function(){

window.CABLINK_FINANCE={

completeRide:function(){

console.log(
"🚕 Ride completed - creating transaction"
);


const fare=
Number(
localStorage.getItem("cablink_last_fare")
||
20
);


const ride={

rideId:
"ride_"+Date.now(),

fare:fare,

state:"COMPLETED",

timestamp:new Date().toISOString()

};



localStorage.setItem(
"cablink_last_completed_ride",
JSON.stringify(ride)
);



window.CABLINK_REWARD.calculate(
ride
);



}

};



window.CABLINK_REWARD={


calculate:function(ride){

const reward=
Math.floor(
ride.fare * 0.05
);



const rewardData={

rideId:ride.rideId,

fare:ride.fare,

THBReward:reward,

timestamp:
new Date().toISOString()

};



localStorage.setItem(
"cablink_thb_reward",
JSON.stringify(rewardData)
);



console.log(
"THB Reward Generated:",
rewardData
);



window.dispatchEvent(

new CustomEvent(
"cablinkRewardCreated",
{
detail:rewardData
}

)

);


}

};



window.addEventListener(
"cablinkRideStateChanged",
function(e){

if(
e.detail.state==="COMPLETED"
){

window.CABLINK_FINANCE.completeRide();

}

});


})();
