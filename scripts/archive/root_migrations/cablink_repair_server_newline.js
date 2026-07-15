const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SERVER SYNTAX REPAIR
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

code=code.replace(
"\\\\n// ── CATCH-ALL",
"// ── CATCH-ALL"
);

fs.writeFileSync(file,code);

console.log("✅ Removed accidental literal \\n");

console.log(`
=========================================
DONE
=========================================
`);
