const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK RIDE STATE MACHINE INSTALL
=========================================
`);


const file="frontend/js/rides/rideStateMachine.js";


const code=`

(function(){


window.CABLINK_RIDE_STATE={


states:[
"REQUESTED",
"ACCEPTED",
"ARRIVING",
"PICKED_UP",
"STARTED",
"COMPLETED",
"CANCELLED"
],



current:
localStorage.getItem("cablink_ride_state")
||
"REQUESTED",



set:function(state){


if(!this.states.includes(state)){

console.log(
"Invalid ride state:",
state
);

return;

}


this.current=state;


localStorage.setItem(
"cablink_ride_state",
state
);



console.log(
"🚕 Ride state:",
state
);



window.dispatchEvent(

new CustomEvent(
"cablinkRideStateChanged",
{
detail:{
state:state
}
}

)

);


},



get:function(){

return this.current;

}



};



window.addEventListener(
"cablinkRideStateChanged",
function(e){

console.log(
"Ride lifecycle update:",
e.detail.state
);

});



})();
`;



fs.writeFileSync(file,code);


console.log(
"✅ Ride state machine created"
);



const index="index.html";

let html=fs.readFileSync(index,"utf8");


const script=
'<script src="frontend/js/rides/rideStateMachine.js"></script>';



if(!html.includes("rideStateMachine.js")){


html=html.replace(
"</body>",
script+"\n</body>"
);


fs.writeFileSync(index,html);


console.log(
"✅ Ride state machine wired"
);


}else{


console.log(
"✅ Already wired"
);


}



execSync(
"node --check frontend/js/rides/rideStateMachine.js",
{
stdio:"inherit"
}
);


console.log(
"✅ Syntax OK"
);



try{

execSync(
'git add index.html frontend/js/rides/rideStateMachine.js && git commit -m "feat: add CabLink ride lifecycle state machine"',
{
stdio:"inherit"
}
);

}catch(e){

console.log(
"No commit"
);

}



console.log(`
=========================================
DONE

RIDE ENGINE:

REQUEST
  ↓
ACCEPT
  ↓
ARRIVE
  ↓
PICKUP
  ↓
START
  ↓
COMPLETE

READY
=========================================
`);

