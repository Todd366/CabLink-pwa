const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PRODUCTION GATE SCOPE FIX
=========================================
`);

const file="cablink_production_gate.js";

let code=fs.readFileSync(file,"utf8");


// Replace broad repository scan with production files only

code=code.replace(
/const source = .*?;/,
`
const productionFiles = [
"index.html",
"vite.config.js",
"package.json",
"backend/server.js",
"backend/services",
"backend/routes"
];

let source="";

for(const item of productionFiles){

if(fs.existsSync(item)){

const stat=fs.statSync(item);

if(stat.isDirectory()){

const files=fs.readdirSync(item);

for(const f of files){

source += fs.readFileSync(item+"/"+f,"utf8");

}

}else{

source += fs.readFileSync(item,"utf8");

}

}

}
`
);


fs.writeFileSync(file,code);

console.log("✅ Production gate now scans active runtime only");

console.log(`
=========================================
DONE
=========================================
`);

