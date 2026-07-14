const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const mount=`

// Live Ride State API
const rideStateAPI=require("./routes/ride_state_api");
app.use("/api", rideStateAPI);

`;

if(!code.includes("rideStateAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Ride state API mounted");

}else{

console.log("Already mounted");

}

