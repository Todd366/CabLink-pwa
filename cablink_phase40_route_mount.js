const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Live Demand Intelligence API
const liveDemandAPI=require("./routes/live_demand_api");
app.use("/api", liveDemandAPI);

`;


if(!code.includes("liveDemandAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Live demand API mounted");

}else{

console.log("Already mounted");

}

