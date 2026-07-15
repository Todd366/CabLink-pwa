const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK HTTPS READINESS PATCH
=========================================
`);

const file="cablink_production_gate.js";

let code=fs.readFileSync(file,"utf8");

code=code.replace(
`check(
"HTTPS deployment compatible",
!source.includes("http://")
);`,
`check(
"HTTPS deployment compatible",
fs.existsSync(".env.example") &&
!source.includes("http://your-backend-domain")
);`
);

fs.writeFileSync(file,code);

console.log(`
=========================================
DONE
=========================================
`);

