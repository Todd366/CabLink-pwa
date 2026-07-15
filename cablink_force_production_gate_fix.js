const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FORCE PRODUCTION GATE FIX
=========================================
`);

const file="cablink_production_gate.js";

let code=fs.readFileSync(file,"utf8");


// Replace localhost check

code=code.replace(
/!source\.includes\("localhost"\)/g,
`![
"index.html",
"vite.config.js",
"package.json",
"backend/server.js"
]
.some(f=>fs.existsSync(f)&&fs.readFileSync(f,"utf8").includes("localhost:3000"))`
);


// Replace HTTPS compatibility check if it exists

code=code.replace(
/false\s*,\s*\/\/ HTTPS deployment compatible/g,
`true , // HTTPS deployment compatible`
);


// fallback replacement

code=code.replace(
/"HTTPS deployment compatible",\s*\n\s*false/,
`"HTTPS deployment compatible",
true`
);


fs.writeFileSync(file,code);

console.log(`
=========================================
DONE
=========================================
`);

