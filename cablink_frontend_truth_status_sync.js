const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FRONTEND STATUS TRUTH SYNC
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");


if(!code.includes("cablinkSyncRideStatus")){

code += `


async function cablinkSyncRideStatus(rideId){

if(!rideId) return;

const res = await fetch(
"/api/rides/"+rideId
);

if(!res.ok) return;

const data = await res.json();

console.log(
"REAL RIDE STATUS:",
data.status
);


if(window.STATE){

STATE.rideStatus=data.status;

}

return data;

}


window.cablinkSyncRideStatus=cablinkSyncRideStatus;


`;

console.log("✅ Added backend ride status sync");

}
else{

console.log("✅ Status sync already exists");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

Frontend can now read:

SEARCHING
ACCEPTED
COMPLETED

from backend truth.

=========================================
`);

