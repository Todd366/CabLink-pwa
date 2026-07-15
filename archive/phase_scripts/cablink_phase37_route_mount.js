const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Driver Economy Dashboard API
const driverEconomyAPI=require("./routes/driver_economy_api");
app.use("/api", driverEconomyAPI);

`;


if(!code.includes("driverEconomyAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Driver economy dashboard route mounted");

}else{

console.log("Already mounted");

}

