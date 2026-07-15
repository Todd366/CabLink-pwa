const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK RIDE SOURCE OF TRUTH CHECK
=========================================
`);

function scan(dir){

if(!fs.existsSync(dir)) return;

for(const f of fs.readdirSync(dir)){

let p=path.join(dir,f);

if(fs.statSync(p).isDirectory()){

scan(p);

}else if(f.endsWith(".json")){

let txt=fs.readFileSync(p,"utf8");

if(txt.includes('"rides"') || txt.includes("RIDE-")){

console.log("\nFOUND:",p);

console.log(
txt.slice(0,500)
);

}

}

}

}


scan("backend");

console.log(`
=========================================
CHECK COMPLETE
=========================================
`);

