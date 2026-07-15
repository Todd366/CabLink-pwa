const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK START SCRIPT REPAIR
=========================================
`);

const file="package.json";

let pkg=JSON.parse(
fs.readFileSync(file,"utf8")
);

pkg.scripts=pkg.scripts||{};

pkg.scripts.start="node backend/server.js";

pkg.scripts.build="vite build";

fs.writeFileSync(
file,
JSON.stringify(pkg,null,2)
);

console.log("✅ Production start script fixed");

console.log(`
CURRENT:

start:
${pkg.scripts.start}

build:
${pkg.scripts.build}

=========================================
DONE
=========================================
`);

