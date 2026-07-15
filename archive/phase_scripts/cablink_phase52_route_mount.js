const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Driver Intelligence API
const driverIntelligenceAPI=require("./routes/driver_intelligence_api");
app.use("/api", driverIntelligenceAPI);

`;


if(!code.includes("driverIntelligenceAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Driver Intelligence API mounted");

}else{

console.log("Already mounted");

}

