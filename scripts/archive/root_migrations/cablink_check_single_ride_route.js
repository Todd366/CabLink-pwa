const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SINGLE RIDE ROUTE CHECK
=========================================
`);

const code=fs.readFileSync("backend/server.js","utf8");


if(code.includes("/api/rides/:id")){

console.log("✅ Single ride route exists");

}else{

console.log("⚠️ Missing GET /api/rides/:id route");

}

console.log(`
=========================================
CHECK COMPLETE
=========================================
`);

