const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FORCE SERVER CLEAN REPAIR
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

const bad="\\n// ── CATCH-ALL";

if(code.includes(bad)){
    code=code.replace(
        bad,
        "// ── CATCH-ALL"
    );
    console.log("✅ Removed literal backslash-n before catch-all");
}
else{
    console.log("⚠️ Exact pattern not found");
}


// extra cleanup
code=code.replace(/\\\\n/g,"\n");

fs.writeFileSync(file,code);

console.log(`
=========================================
DONE
=========================================
`);
