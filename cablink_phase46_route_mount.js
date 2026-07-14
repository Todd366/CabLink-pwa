const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Live Ride State API
const liveRideAPI=require("./routes/live_ride_api");
app.use("/api", liveRideAPI);

`;


if(!code.includes("liveRideAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Live ride API mounted");

}else{

console.log("Already mounted");

}

