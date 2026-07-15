const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Identity Engine API
const identityAPI=require("./routes/identity_api");
app.use("/api", identityAPI);

`;


if(!code.includes("identityAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Identity API mounted");

}else{

console.log("Already mounted");

}

