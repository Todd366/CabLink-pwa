const fs=require("fs");

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


if(code.includes("ride_api")){
console.log("already mounted");
process.exit();
}


code=code.replace(
'const driverOnlineAPI=require("./routes/driver_online_api");',
'const driverOnlineAPI=require("./routes/driver_online_api");\nconst rideAPI=require("./routes/ride_api");'
);


code=code.replace(
'app.use("/api",driverOnlineAPI);',
'app.use("/api",driverOnlineAPI);\napp.use("/api",rideAPI);'
);


fs.writeFileSync(file,code);


console.log("✅ Ride API mounted");

