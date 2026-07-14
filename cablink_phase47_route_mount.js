const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Driver Location Tracking API
const driverLocationAPI=require("./routes/driver_location_api");
app.use("/api", driverLocationAPI);

`;


if(!code.includes("driverLocationAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Driver location API mounted");

}else{

console.log("Already mounted");

}

