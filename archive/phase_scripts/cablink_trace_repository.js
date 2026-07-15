const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REPOSITORY TRACE
=========================================
`);

let files=[
"backend/database/ride_repository.js",
"backend/storage/database.js"
];

for(const f of files){

console.log("\n===== "+f+" =====");

if(fs.existsSync(f)){
console.log(fs.readFileSync(f,"utf8"));
}else{
console.log("❌ missing");
}

}

