const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DUPLICATE RIDES ROUTE CLEANUP
=========================================
`);

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

fs.copyFileSync(
file,
file+".backup_route_cleanup_"+Date.now()
);


// remove old inline rides endpoints

let patterns=[
/app\.post\(['"]\/api\/rides\/book['"][\s\S]*?\n\}\);/g,
/app\.post\(['"]\/api\/rides\/create['"][\s\S]*?\n\}\);/g,
/app\.get\(['"]\/api\/rides['"][\s\S]*?\n\}\);/g
];


for(const p of patterns){

let before=code.length;

code=code.replace(p,"");

if(code.length!==before){
console.log("✅ Removed duplicate inline ride route");
}

}


fs.writeFileSync(file,code);

console.log(`
✅ Server now uses backend/routes/rides.js only
`);

