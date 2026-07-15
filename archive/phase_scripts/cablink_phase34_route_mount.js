const fs=require("fs");

const file="backend/server.js";
let code=fs.readFileSync(file,"utf8");

const mount=`

// Ride Economy API
const rideEconomyAPI=require("./routes/ride_economy_api");
app.use("/api", rideEconomyAPI);

`;

if(!code.includes("rideEconomyAPI")){
code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Ride economy API mounted");
}else{
console.log("Already mounted");
}

