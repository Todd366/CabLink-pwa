const fs=require("fs");
const path=require("path");

console.log(`
=====================================
🚕 CABLINK ENGINE CONNECTION MAP
=====================================
`);

let targets=[
"frontend/js/app.js",
"frontend/js/core.js",
"frontend/js/ride_engine.js",
"frontend/js/operations_core.js",
"frontend/js/bstm_hub_ui.js"
];

targets.forEach(file=>{

console.log("\nFILE:",file);

if(!fs.existsSync(file)){
 console.log("❌ Missing");
 return;
}

let c=fs.readFileSync(file,"utf8");

[
"bookRide",
"connectWallet",
"claimReward",
"simulateRide",
"fetch",
"api",
"dispatch",
"firebase"
].forEach(word=>{

if(c.includes(word)){
 console.log("✅",word);
}

});

});

console.log(`
=====================================
DONE
=====================================
`);

