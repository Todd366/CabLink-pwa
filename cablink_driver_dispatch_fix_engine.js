const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER DISPATCH FIX ENGINE
=========================================
`);

const file="frontend/js/operations_core.js";

if(!fs.existsSync(file)){
 console.log("❌ operations_core.js missing");
 process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


if(code.includes("dispatch")){
 console.log("✅ Dispatch function already exists");
}else{

code += `


/*
=========================================
CABLINK DRIVER DISPATCH ENGINE
=========================================
*/

window.CABLINK_OPS = window.CABLINK_OPS || {};


window.CABLINK_OPS.dispatch=function(ride,drivers){


if(!ride){

return {

success:false,

message:"No ride"

};

}



if(!drivers || drivers.length===0){

return {

success:false,

message:"No available drivers"

};

}



let driver=drivers[0];


ride.driverId=driver.id;

ride.driver=driver;

ride.status="DRIVER_ASSIGNED";


return {

success:true,

ride:ride,

driver:driver

};


};



console.log("🚕 CabLink Driver Dispatch Engine ready");


`;

fs.writeFileSync(file,code);

console.log("✅ Driver dispatch injected");

}



console.log(`
=========================================
DISPATCH FIX COMPLETE
=========================================
`);

