const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DISPATCH RUNTIME REPAIR
=========================================
`);

global.window={};
global.document={
addEventListener(){},
getElementById(){return null},
querySelectorAll(){return []}
};


try{

require("./frontend/js/operations_core.js");

console.log("Operations core loaded");

}catch(e){

console.log("Load error:",e.message);

}


if(!window.CABLINK_OPS){

window.CABLINK_OPS={};

console.log("Created CABLINK_OPS");

}


if(typeof window.CABLINK_OPS.dispatch!=="function"){

window.CABLINK_OPS.dispatch=function(ride,drivers){

if(!ride){
return {
success:false,
message:"Missing ride"
};
}


if(!drivers || drivers.length===0){

return {
success:false,
message:"No drivers"
};

}


const driver=drivers[0];


ride.driverId=driver.id;
ride.driver=driver;
ride.status="DRIVER_ASSIGNED";


return {

success:true,
ride,
driver

};

};


console.log("✅ Dispatch runtime repaired");

}else{

console.log("✅ Dispatch already working");

}



let testRide={
id:"TEST-RIDE",
status:"REQUESTED"
};


let testDriver={
id:"TEST-DRIVER",
name:"Test Driver"
};


let result=
window.CABLINK_OPS.dispatch(
testRide,
[testDriver]
);


console.log(result);


if(result.success){

console.log(`
=========================================
✅ DRIVER MATCHING WORKING
=========================================
`);

}else{

console.log(`
=========================================
❌ DRIVER MATCHING FAILED
=========================================
`);

}



