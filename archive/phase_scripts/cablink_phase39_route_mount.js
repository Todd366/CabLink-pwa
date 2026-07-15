const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const mount=`

// Driver Visibility APIs
const driverDemandAPI=require("./routes/driver_demand_api");
app.use("/api", driverDemandAPI);

const updatesAPI=require("./routes/updates_api");
app.use("/api", updatesAPI);

`;

if(!code.includes("driverDemandAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Visibility routes mounted");

}else{

console.log("Already mounted");

}

