const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Smart Dispatch API
const dispatchAPI=require("./routes/dispatch_api");
app.use("/api", dispatchAPI);

`;


if(!code.includes("dispatchAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Dispatch API mounted");

}else{

console.log("Already mounted");

}

