const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DEPLOY PACKAGE CHECK
=========================================
`);

const checks=[
["Frontend build","dist/index.html"],
["Backend entry","backend/server.js"],
["Package","package.json"],
["Environment template",".env.example"],
["Deployment guide","DEPLOYMENT_READY.md"]
];

let pass=0;

for(const [name,file] of checks){

if(fs.existsSync(file)){
console.log("✅",name);
pass++;
}else{
console.log("❌",name);
}

}

console.log(`
=========================================
RESULT

${pass}/${checks.length}

=========================================
`);

if(pass===checks.length){
console.log("🚀 READY TO CONNECT HOSTING");
}

