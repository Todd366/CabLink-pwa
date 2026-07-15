const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RELEASE CHECKPOINT
=========================================
`);

const checks=[
["Production build","dist"],
["Backend entry","backend/server.js"],
["Environment template",".env.example"],
["Deployment notes","DEPLOYMENT_READY.md"],
["Package config","package.json"],
["Git repository",".git"]
];

let passed=0;

for(const [name,file] of checks){

if(fs.existsSync(file)){
console.log("✅",name,file);
passed++;
}else{
console.log("❌",name,file);
}

}

console.log(`
=========================================
RELEASE SCORE

${passed}/${checks.length}

=========================================
`);

if(passed===checks.length){
console.log("🚀 CABLINK RELEASE CANDIDATE READY");
}else{
console.log("⚠️ Missing release component");
}

