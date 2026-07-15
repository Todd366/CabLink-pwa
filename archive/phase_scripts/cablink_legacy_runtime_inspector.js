const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK LEGACY RUNTIME INSPECTOR
=========================================
`);

let file="frontend/components/LegacyCabLink.jsx";


if(!fs.existsSync(file)){
console.log("❌ LegacyCabLink.jsx missing");
process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


console.log(`
FILE:
${file}

SIZE:
${code.length} characters

`);

let keywords=[
"simulate",
"fake",
"driver",
"nearby",
"accepted",
"book",
"ride",
"request",
"mock",
"online",
"offline",
"dispatch",
"match",
"fetch",
"api",
"/api"
];


keywords.forEach(k=>{

let lines=code
.split("\n")
.map((x,i)=>x.includes(k)?`${i+1}: ${x.trim()}`:null)
.filter(Boolean);


if(lines.length){

console.log("\n========== "+k+" ==========");

lines.slice(0,20)
.forEach(x=>console.log(x));

}

});


console.log(`
=========================================
IMPORTS
=========================================
`);

let imports=code.match(/import .* from .*/g);

if(imports)
imports.forEach(x=>console.log(x));


console.log(`
=========================================
END
=========================================
`);

