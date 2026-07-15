const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK DRIVER LIFECYCLE CONTROLS
=========================================
`);

const file="frontend/js/driver/driverLifecycleControls.js";


const code=`

(function(){

function setState(state){

if(window.CABLINK_RIDE_STATE){

window.CABLINK_RIDE_STATE.set(state);

console.log(
"Driver changed ride state:",
state
);

}else{

console.log(
"Ride state engine not loaded"
);

}

}



function createControls(){


if(document.getElementById(
"driverLifecyclePanel"
))
return;



const panel=document.createElement("div");


panel.id="driverLifecyclePanel";


panel.style.position="fixed";
panel.style.bottom="170px";
panel.style.right="12px";
panel.style.zIndex="99999";
panel.style.background="white";
panel.style.padding="12px";
panel.style.borderRadius="12px";
panel.style.boxShadow="0 3px 15px rgba(0,0,0,.2)";
panel.style.fontFamily="sans-serif";



panel.innerHTML=

"<b>🚕 Ride Controls</b><br><br>"+

"<button id='arriveBtn'>Arrived</button><br>"+
"<button id='pickupBtn'>Picked Up</button><br>"+
"<button id='startBtn'>Start Trip</button><br>"+
"<button id='completeBtn'>Complete</button>";



document.body.appendChild(panel);



document.getElementById(
"arriveBtn"
)
.onclick=function(){

setState("ARRIVING");

};



document.getElementById(
"pickupBtn"
)
.onclick=function(){

setState("PICKED_UP");

};



document.getElementById(
"startBtn"
)
.onclick=function(){

setState("STARTED");

};



document.getElementById(
"completeBtn"
)
.onclick=function(){

setState("COMPLETED");

};



}



window.addEventListener(
"cablinkRoleChanged",
function(e){

if(e.detail.role==="DRIVER"){

createControls();

}

});


if(
localStorage.getItem("cablink_role")
==="DRIVER"
){

createControls();

}



})();
`;


fs.writeFileSync(
file,
code
);


console.log(
"✅ Driver lifecycle controls created"
);



const index="index.html";

let html=fs.readFileSync(index,"utf8");


const script=
'<script src="frontend/js/driver/driverLifecycleControls.js"></script>';



if(!html.includes(
"driverLifecycleControls.js"
)){


html=html.replace(
"</body>",
script+"\n</body>"
);


fs.writeFileSync(
index,
html
);


console.log(
"✅ Driver lifecycle controls wired"
);


}else{

console.log(
"✅ Already wired"
);

}



execSync(
"node --check frontend/js/driver/driverLifecycleControls.js",
{
stdio:"inherit"
}
);


console.log(
"✅ Syntax OK"
);



try{

execSync(
'git add index.html frontend/js/driver/driverLifecycleControls.js && git commit -m "feat: add driver ride lifecycle controls"',
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

DRIVER FLOW:

ACCEPTED
   ↓
ARRIVING
   ↓
PICKED_UP
   ↓
STARTED
   ↓
COMPLETED

READY
=========================================
`);

