const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK GATE SCAN ENGINE REPAIR
=========================================
`);

const file="cablink_production_gate.js";

let code=fs.readFileSync(file,"utf8");

const start=code.indexOf("const source");

const end=code.indexOf("checks.push", start);

if(start!==-1 && end!==-1){

const replacement=`
let source="";

const productionTargets=[
"index.html",
"vite.config.js",
"package.json",
"backend/server.js"
];

for(const target of productionTargets){

if(fs.existsSync(target)){
source += fs.readFileSync(target,"utf8");
}

}

`;

code =
code.substring(0,start)
+
replacement
+
code.substring(end);

console.log("✅ Replaced gate source scanner");

}else{

console.log("⚠️ Could not locate scan block");
console.log("Start:",start,"End:",end);

}


fs.writeFileSync(file,code);

console.log(`
=========================================
DONE
=========================================
`);

