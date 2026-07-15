const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Smart Driver Matching API
const matchingAPI=require("./routes/matching_api");
app.use("/api", matchingAPI);

`;


if(!code.includes("matchingAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Matching API mounted");

}else{

console.log("Already mounted");

}

