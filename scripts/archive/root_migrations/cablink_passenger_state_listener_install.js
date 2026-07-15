const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK PASSENGER STATE LISTENER
=========================================
`);

const file="frontend/js/rides/passengerRideStatus.js";

const code=`

(function(){

function createStatus(){

if(document.getElementById(
"passengerRideStatus"
))
return;


const box=document.createElement("div");

box.id="passengerRideStatus";

box.style.position="fixed";
box.style.bottom="20px";
box.style.left="12px";
box.style.zIndex="9999";
box.style.background="white";
box.style.padding="12px";
box.style.borderRadius="12px";
box.style.boxShadow="0 3px 15px rgba(0,0,0,.2)";
box.style.fontFamily="sans-serif";


box.innerHTML=
"🚕 Ride Status: "+
(
window.CABLINK_RIDE_STATE
?
window.CABLINK_RIDE_STATE.get()
:
"REQUESTED"
);


document.body.appendChild(box);

}


function update(state){

const box=document.getElementById(
"passengerRideStatus"
);

if(box){

box.textContent=
"🚕 Ride Status: "+state;

}

}


window.addEventListener(
"cablinkRideStateChanged",
function(e){

createStatus();

update(
e.detail.state
);

});


createStatus();


})();

`;


fs.writeFileSync(file,code);

console.log("✅ Passenger listener created");


const index="index.html";

let html=fs.readFileSync(index,"utf8");

const script=
'<script src="frontend/js/rides/passengerRideStatus.js"></script>';


if(!html.includes("passengerRideStatus.js")){

html=html.replace(
"</body>",
script+"\n</body>"
);

fs.writeFileSync(index,html);

console.log("✅ Passenger listener wired");

}else{

console.log("✅ Already wired");

}


execSync(
"node --check frontend/js/rides/passengerRideStatus.js",
{
stdio:"inherit"
}
);

console.log("✅ Syntax OK");


try{

execSync(
'git add index.html frontend/js/rides/passengerRideStatus.js && git commit -m "feat: add passenger ride status listener"',
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

PASSENGER FLOW:

REQUEST
 ↓
WAITING
 ↓
DRIVER ACCEPTED
 ↓
LIVE STATUS

=========================================
`);

