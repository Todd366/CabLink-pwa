const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK COMPLETION FINANCE REWARD BRIDGE
=========================================
`);

const file="frontend/js/rides/completionRewardBridge.js";


const code=`

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
`;

fs.writeFileSync(file,code);

console.log("✅ Completion reward bridge created");


const index="index.html";

let html=fs.readFileSync(index,"utf8");

const script=
'<script src="frontend/js/rides/completionRewardBridge.js"></script>';


if(!html.includes("completionRewardBridge.js")){

html=html.replace(
"</body>",
script+"\n</body>"
);

fs.writeFileSync(index,html);

console.log("✅ Completion reward bridge wired");

}else{

console.log("✅ Already wired");

}



execSync(
"node --check frontend/js/rides/completionRewardBridge.js",
{
stdio:"inherit"
}
);


console.log("✅ Syntax OK");


try{

execSync(
'git add index.html frontend/js/rides/completionRewardBridge.js && git commit -m "feat: connect ride completion to fare and THB rewards"',
{
stdio:"inherit"
}
);

}catch(e){

console.log("No commit");

}



console.log(`
=========================================
DONE

FINAL RIDE LOOP:

COMPLETE
   ↓
FARE RECORD
   ↓
THB REWARD
   ↓
USER WALLET READY

NEXT:
CabLink architecture cleanup
=========================================
`);

