const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Ride Completion Economy API
const completionAPI=require("./routes/completion_api");
app.use("/api", completionAPI);

`;


if(!code.includes("completionAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Completion API mounted");

}else{

console.log("Already mounted");

}

