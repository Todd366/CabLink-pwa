const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK API CONNECTOR v1
=========================================
`);

const server="backend/server.js";

fs.copyFileSync(
server,
"backend/server_before_api_layer.bak"
);

let code=fs.readFileSync(server,"utf8");


const injection=`

// ================================
// CABLINK OPERATION API LAYER
// ================================

const rideService=require("./services/ride_service");
const driverService=require("./services/driver_service");
const paymentService=require("./services/payment_service");
const rewardService=require("./services/reward_service");


app.post("/api/rides/create",function(req,res){

const ride=
rideService.create(req.body||{});

res.json({
success:true,
ride:ride
});

});


app.get("/api/rides",function(req,res){

res.json({
success:true,
rides:rideService.list()
});

});


app.post("/api/drivers/register",function(req,res){

const driver=
driverService.register(req.body||{});

res.json({
success:true,
driver:driver
});

});


app.get("/api/drivers/available",function(req,res){

res.json({
success:true,
drivers:driverService.available()
});

});


app.post("/api/payments/create",function(req,res){

res.json({
success:true,
transaction:
paymentService.create(
req.body.ride,
req.body.finance
)
});

});


app.post("/api/rewards/create",function(req,res){

res.json({
success:true,
reward:
rewardService.create(
req.body.userId,
req.body.rideId
)
});

});


app.get("/api/system/status",function(req,res){

res.json({

system:"CabLink",

version:"5.0",

status:"operational",

timestamp:new Date().toISOString()

});

});


// ================================
// END CABLINK API LAYER
// ================================

`;


// insert before catch-all route

code=code.replace(
"// ── CATCH-ALL",
injection+"\n// ── CATCH-ALL"
);


fs.writeFileSync(server,code);


console.log("✅ API layer injected");


