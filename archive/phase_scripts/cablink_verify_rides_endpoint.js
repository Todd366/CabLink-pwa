const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDES ENDPOINT VERIFICATION
=========================================
`);

let server=fs.readFileSync(
"backend/server.js",
"utf8"
);

console.log("\n=== ROUTE MOUNT CHECK ===");

if(server.includes('require("./routes/rides")')){
console.log("✅ rides route imported");
}else{
console.log("❌ rides route NOT imported");
}


if(server.includes('ridesAPI')){
console.log("✅ ridesAPI variable exists");
}else{
console.log("❌ ridesAPI missing");
}


console.log(`
=== RIDE ROUTE FILE ===
`);

let route="backend/routes/rides.js";

if(fs.existsSync(route)){
console.log(fs.readFileSync(route,"utf8").slice(0,1000));
}else{
console.log("❌ rides.js missing");
}


console.log(`
=========================================
CHECK COMPLETE
=========================================
`);

