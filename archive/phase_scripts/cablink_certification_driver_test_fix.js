const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK CERTIFICATION DRIVER TEST FIX
=========================================
`);

const file="cablink_launch_certification_engine.js";

let code=fs.readFileSync(file,"utf8");


// Replace driver test block to ensure operations core is loaded

const old=`const dispatch=
window.CABLINK_OPS
?
window.CABLINK_OPS.dispatch(
ride,
[driver]
)
:null;`;


const fresh=`
// Ensure operations engine loaded

require("./frontend/js/operations_core.js");


const dispatch=
window.CABLINK_OPS
?
window.CABLINK_OPS.dispatch(
ride,
[driver]
)
:null;`;


if(code.includes(old)){

code=code.replace(old,fresh);

fs.writeFileSync(file,code);

console.log("✅ Driver certification flow patched");

}else{

console.log("⚠️ Original block not found - checking already patched");

}


