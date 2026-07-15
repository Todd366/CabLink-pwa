

/*
=========================================
🚕 CABLINK STATE RECOVERY
=========================================
*/

function CABLINK_STATE_RECOVERY(){

const keys=[
"cl6_state",
"cablink_state",
"rideState",
"activeRide",
"currentRide"
];

const now=Date.now();

keys.forEach(key=>{

try{

let raw=localStorage.getItem(key);

if(!raw) return;

let data=JSON.parse(raw);

let created =
data.createdAt ||
data.timestamp ||
data.time ||
0;

if(created){

let age=now-new Date(created).getTime();


// Clear rides older than 2 hours
if(age > 7200000){

console.log(
"🚕 Removing stale CabLink state:",
key
);

localStorage.removeItem(key);

}

}

}catch(e){

console.log(
"🧹 Cleaning corrupted state:",
key
);

localStorage.removeItem(key);

}

});

}

CABLINK_STATE_RECOVERY();



// =========================================
// CABLINK_REAL_API_BRIDGE
// =========================================

async function sendRideToBackend(ride){

try{

const response=await fetch(
"/api/rides",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(ride)
}
);


const data=await response.json();


console.log(
"🚕 Backend ride created:",
data
);


window.CABLINK_REAL_RIDE=data.ride;


}catch(error){

console.error(
"❌ Backend ride failed",
error
);

}

}

console.log("🚀 CabLink App Logic Loaded");

// Your existing fixes go here


window.toggleDriverMode = function() {
    showDriverRegistrationForm();
};

window.submitDriverForm = function() {
    const name = document.getElementById('d-name').value.trim();
    const phone = document.getElementById('d-phone').value.trim();
    if (!name || !phone) return toast("Name and phone required", "warning");
    document.querySelector('.driver-modal').remove();
    toast("✅ Application submitted!", "success");
};

console.log("✅ Core logic loaded from separate file");
