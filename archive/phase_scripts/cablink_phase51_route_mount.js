const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Ride Orchestrator API
const orchestratorAPI=require("./routes/orchestrator_api");
app.use("/api", orchestratorAPI);

`;


if(!code.includes("orchestratorAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Orchestrator API mounted");

}else{

console.log("Already mounted");

}

