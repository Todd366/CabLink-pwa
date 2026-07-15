const fs=require("fs");

console.log(`
=========================================
🚕 PHASE 30 ROUTE ORDER FIX
MOVE BSTM API BEFORE SPA FALLBACK
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const mount=`
// BSTM Marketplace Task Bridge
const ecosystemTasks=require("./routes/ecosystem_tasks");
app.use("/api/ecosystem", ecosystemTasks);
`;


// remove old mount

code=code.replace(mount,"");


// insert before catch-all

const target="// ── CATCH-ALL → serve index.html (SPA routing) ───────────────";

if(code.includes(target)){

code=code.replace(
target,
mount+"\n\n"+target
);

fs.writeFileSync(file,code);

console.log("✅ Route moved before SPA fallback");

}else{

console.log("❌ Catch-all location not found");

}


console.log(`
=========================================

DONE

Restart backend:

CTRL+C

npm run backend

Then test:

node frontend/testing/live_driver_economy_test.js

=========================================
`);

