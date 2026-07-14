const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const mount=`

// Passenger Intelligence API
const passengerIntelligenceAPI=require("./routes/passenger_intelligence_api");
app.use("/api", passengerIntelligenceAPI);

`;

if(!code.includes("passengerIntelligenceAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Passenger Intelligence API mounted");

}else{

console.log("Already mounted");

}
