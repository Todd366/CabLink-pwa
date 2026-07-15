const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 33 REAL ROUTE REPAIR
MOVE API ABOVE SPA FALLBACK
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const mount=`
// Driver Dashboard Economy API
const driverDashboardAPI=require("./routes/driver_dashboard_api");
app.use("/api", driverDashboardAPI);

`;

// remove all existing copies
code=code.replace(
/\/\/ Driver Dashboard Economy API[\s\S]*?app\.use\("\/api", driverDashboardAPI\);\s*/g,
""
);


// remove catch-all temporarily
const catchAll=`// ── CATCH-ALL → serve index.html (SPA routing) ───────────────`;

const parts=code.split(catchAll);


if(parts.length===2){

let before=parts[0];
let after=parts[1];

code=
before+
mount+
catchAll+
after;

fs.writeFileSync(file,code);

console.log("✅ API moved before SPA fallback");

}else{

console.log("❌ Catch-all split failed");

}

