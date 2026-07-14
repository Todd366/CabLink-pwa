const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK OPERATIONS CORE INSTALLER v1
=========================================
`);


// CREATE OPERATIONS ENGINE

const engine=`

(function(){

"use strict";


window.CABLINK_OPS={


createTransaction:function(ride){

const fare=ride.fare||0;

return {

rideId:ride.id,

customerPayment:fare,

driverShare:
Number((fare*0.75).toFixed(2)),

platformFee:
Number((fare*0.10).toFixed(2)),

thbReward:1,

status:"PENDING",

createdAt:new Date().toISOString()

};

},



completeRide:function(ride){

ride.status="TRIP_COMPLETE";

ride.completedAt=new Date().toISOString();

return ride;

},



dispatch:function(ride,drivers){

if(!drivers||drivers.length===0){

return {
success:false,
message:"No drivers available"
};

}


return {

success:true,

driver:drivers[0],

rideId:ride.id,

status:"DRIVER_FOUND"

};

}


};


console.log("🚕 CabLink Operations Core ready");


})();
`;

fs.writeFileSync(
"frontend/js/operations_core.js",
engine
);


console.log("✅ operations_core.js created");



// INJECT SCRIPT

let html=fs.readFileSync("index.html","utf8");

if(!html.includes("operations_core.js")){

html=html.replace(
"</body>",
'<script src="frontend/js/operations_core.js"></script>\n</body>'
);

fs.writeFileSync("index.html",html);

console.log("✅ Operations Core injected");

}else{

console.log("ℹ️ Already installed");

}



