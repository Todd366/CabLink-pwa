const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK STORAGE CLEANUP
=========================================
`);

let file="backend/services/ride_state_service.js";

let code=fs.readFileSync(file,"utf8");

if(code.includes("cablink_db.json")){
 console.log("✅ Already using unified storage");
 process.exit(0);
}

console.log("⚠️ Checking state service");

console.log(code.slice(0,300));

