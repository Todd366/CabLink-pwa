const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SERVER SAFE RESTORE
=========================================
`);

let files=fs.readdirSync("backend")
.filter(f=>f.includes("server.js.backup_route_cleanup"));

if(files.length===0){

console.log("❌ Backup not found");
process.exit(1);

}

let backup="backend/"+files.sort().pop();

console.log("Restoring:",backup);


fs.copyFileSync(
backup,
"backend/server.js"
);


let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


// Remove only route declaration blocks safely using boundaries

function removeBetween(startText,endText){

let start=code.indexOf(startText);

if(start===-1)return;

let end=code.indexOf(endText,start);

if(end===-1)return;


code=
code.substring(0,start)
+
code.substring(end);

console.log(
"Removed:",
startText
);

}


// remove old inline routes

removeBetween(
"app.post('/api/rides/book'",
"app.post(\"/api/rides/create\""
);


removeBetween(
"app.post(\"/api/rides/create\"",
"app.get(\"/api/rides\""
);


removeBetween(
"app.get(\"/api/rides\"",
"const ridesAPI=require"
);


fs.writeFileSync(
file,
code
);


console.log(`
✅ server.js repaired
`);

