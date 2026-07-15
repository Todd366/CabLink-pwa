const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DISPATCH ACTIVATION FIX
=========================================
`);

const cert="cablink_launch_certification_engine.js";

let code=fs.readFileSync(cert,"utf8");


if(!code.includes('operations_core.js')){

code=code.replace(
'// ================================\n// DRIVER FLOW',
`
// LOAD OPERATIONS CORE

try{

require("./frontend/js/operations_core.js");

console.log("🚕 Operations Core loaded");

}catch(e){

console.log("Operations Core load error:",e.message);

}


// ================================
// DRIVER FLOW`
);


fs.writeFileSync(cert,code);

console.log("✅ Operations Core added to certification");

}else{

console.log("✅ Already loaded");

}


