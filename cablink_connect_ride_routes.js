const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDE ROUTE CONNECTOR
=========================================
`);

const file="backend/server.js";

if(!fs.existsSync(file)){
 console.log("❌ server.js missing");
 process.exit(1);
}

let code=fs.readFileSync(file,"utf8");


// Add import

if(!code.includes("rideService")){

code=code.replace(
"const path    = require('path');",
"const path    = require('path');\nconst rideService = require('./services/rideService');"
);

console.log("✅ Added rideService import");

}


// Add lifecycle routes before catch all

if(!code.includes("/accept")){

let routes=`


// ===== REAL RIDE LIFECYCLE =====

app.patch('/api/rides/:id/accept', function(req,res){

const ride = rideService.acceptRide(
req.params.id,
req.body.driverId
);

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});


app.patch('/api/rides/:id/complete', function(req,res){

const ride = rideService.completeRide(
req.params.id
);

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});


// ===============================

`;

code=code.replace(
"// ── CATCH-ALL",
routes+"\n// ── CATCH-ALL"
);

console.log("✅ Added acceptRide endpoint");
console.log("✅ Added completeRide endpoint");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
✅ ROUTES CONNECTED
=========================================

Available:

PATCH /api/rides/:id/accept

PATCH /api/rides/:id/complete

=========================================
`);

