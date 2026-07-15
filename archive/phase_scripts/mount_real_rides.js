const fs=require("fs");

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


if(!code.includes("routes/rides")){

code=code.replace(
'const driverOnlineAPI=require("./routes/driver_online_api");',
'const driverOnlineAPI=require("./routes/driver_online_api");\nconst ridesAPI=require("./routes/rides");'
);


code=code.replace(
'app.use("/api",driverOnlineAPI);',
'app.use("/api",driverOnlineAPI);\napp.use("/api",ridesAPI);'
);

}


fs.writeFileSync(file,code);

console.log("✅ Real rides route mounted");

