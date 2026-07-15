const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK ORCHESTRATOR IDENTITY REPAIR
=========================================
`);

let file="backend/services/ride_orchestrator_service.js";

let code=fs.readFileSync(file,"utf8");


fs.copyFileSync(
file,
file+".backup_orchestrator_"+Date.now()
);


// Replace assignDriver function

let start=code.indexOf("function assignDriver(");

let end=code.indexOf("\n\n\nfunction driverArrived",start);


if(start===-1 || end===-1){
 console.log("❌ assignDriver section not found");
 process.exit(1);
}


let replacement=`function assignDriver(id,driver){

let ride =
state.get(id);


if(!ride){

console.log(
"❌ Ride not found:",
id
);

return null;

}


ride.driver=driver;

ride.status="DRIVER_FOUND";


state.update(
id,
"DRIVER_FOUND"
);


notify.notify({

ride:id,

driver,

user:ride.passenger,

type:"DRIVER_ASSIGNED",

message:"Driver has been assigned"

});


return ride;

}`;


code=
code.substring(0,start)
+
replacement
+
code.substring(end);


fs.writeFileSync(file,code);


console.log(
"✅ Orchestrator now uses live ride state"
);

