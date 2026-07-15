const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER API REALITY CHECK
=========================================
`);

let files=[];

function scan(dir){

if(!fs.existsSync(dir)) return;

fs.readdirSync(dir).forEach(f=>{

let p=dir+"/"+f;

if(fs.statSync(p).isDirectory())
scan(p);

else if(f.endsWith(".js"))
files.push(p);

});

}

scan("backend");


let found=false;


files.forEach(file=>{

let code=fs.readFileSync(file,"utf8");


if(
code.includes("/drivers/online") ||
code.includes("drivers/online")
){

console.log("✅ DRIVER ONLINE API FOUND:");
console.log(file);

found=true;

}

});


if(!found){

console.log(`
❌ No /api/drivers/online route found

Next action:
connect driver routes
`);

}


console.log(`
=========================================
CHECK COMPLETE
=========================================
`);

