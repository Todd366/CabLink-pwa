const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REMOVE FAKE COMPLETION ENGINE
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");


// Remove automatic timer completion

const old="setTimeout(completeRide, 8000);";

if(code.includes(old)){

code=code.replace(
old,
"// REAL COMPLETION: controlled by driver lifecycle API"
);

console.log("✅ Removed automatic completion timer");

}
else{

console.log("⚠️ Completion timer not found");

}


// Disable simulation function name

if(code.includes("function simulateRide()")){

code=code.replace(
"function simulateRide()",
"function legacy_simulateRide_disabled()"
);

console.log("✅ Disabled simulateRide function");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

Ride completion now requires:

PATCH /api/rides/:id/complete

=========================================
`);

