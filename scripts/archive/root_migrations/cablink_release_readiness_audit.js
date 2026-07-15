const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RELEASE READINESS AUDIT
=========================================
`);

const checks=[
["Frontend","index.html"],
["Backend","backend/server.js"],
["Ride database","backend/database/rideRepository.js"],
["Ride storage","backend/database/rides.json"],
["Manifest","manifest.json"],
["Service worker","sw.js"]
];

let score=0;

for(const [name,file] of checks){

if(fs.existsSync(file)){
 console.log("✅",name,":",file);
 score++;
}else{
 console.log("❌",name,":",file);
}

}


console.log(`
CORE FILE SCORE:
${score}/${checks.length}

=========================================
API CHECKS
=========================================
`);

const server=fs.readFileSync("backend/server.js","utf8");

[
"/api/rides",
"/api/rides/:id/accept",
"/api/rides/:id/complete",
"/api/drivers/online"
].forEach(route=>{

if(server.includes(route)){
console.log("✅",route);
}else{
console.log("⚠️ Missing",route);
}

});


console.log(`
=========================================
RELEASE STATUS
=========================================
`);

console.log(
score>=5 ?
"READY FOR DEPLOYMENT REVIEW 🚀":
"NEEDS REPAIR"
);

