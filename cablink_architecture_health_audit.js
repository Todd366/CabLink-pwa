const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK ARCHITECTURE HEALTH AUDIT
=========================================
`);

const roots=[
"frontend",
"backend",
"docs",
"archive",
"scripts"
];


function scan(dir,depth=0){

if(!fs.existsSync(dir))
return;

const items=fs.readdirSync(dir);

for(const item of items){

const full=path.join(dir,item);

let stat;

try{
stat=fs.statSync(full);
}catch(e){
continue;
}

let prefix=" ".repeat(depth*2);

if(stat.isDirectory()){

console.log(prefix+"📁 "+full);

if(depth<2)
scan(full,depth+1);

}else{

console.log(prefix+"📄 "+full);

}

}

}


roots.forEach(r=>{

console.log("\nROOT:",r);

scan(r);

});


console.log(`
=========================================
ROOT FILE ANALYSIS
=========================================
`);


const rootFiles=fs.readdirSync(".")
.filter(f=>fs.statSync(f).isFile());


rootFiles.forEach(f=>{

if(
f.endsWith(".js") ||
f.endsWith(".html") ||
f.endsWith(".json")
){

console.log("⚠️ Root:",f);

}

});


console.log(`
=========================================
AUDIT COMPLETE

Next:
1. Archive old migration scripts
2. Normalize folders
3. Create clean structure
4. Run final health check

=========================================
`);

