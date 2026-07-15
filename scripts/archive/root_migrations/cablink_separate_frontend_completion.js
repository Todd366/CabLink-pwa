const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SEPARATE RIDE COMPLETION LOGIC
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");


// Rename frontend function only

if(code.includes("function completeRide(){")){

code=code.replace(
"function completeRide(){",
"function recordCompletedRide(){"
);

console.log("✅ Renamed frontend completion handler");

}


// Update internal calls from status polling

code=code.replace(
"clearInterval(_rideStatusPoller);\ncompleteRide();",
"clearInterval(_rideStatusPoller);\nrecordCompletedRide();"
);


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

Backend owns:
PATCH /api/rides/:id/complete

Frontend owns:
recordCompletedRide()

=========================================
`);

