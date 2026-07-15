const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK INDEX RUNTIME MAP
=========================================
`);

let files=[
"index.html",
"frontend/index.html"
];


files.forEach(file=>{

if(!fs.existsSync(file)){
console.log("❌ Missing",file);
return;
}

console.log("\n==============================");
console.log(file);
console.log("==============================");


let code=fs.readFileSync(file,"utf8");


let scripts=code.match(/<script[^>]*src=["'][^"']+["']/g);

console.log("\nSCRIPT CONNECTIONS:");

if(scripts)
scripts.forEach(x=>console.log(x));
else
console.log("None");


let keywords=[
"simulate",
"fake",
"driver",
"nearby",
"accepted",
"bookRide",
"function",
"fetch",
"/api",
"DOMContentLoaded"
];


keywords.forEach(k=>{

let hits=code
.split("\n")
.map((x,i)=>x.includes(k)?`${i+1}: ${x.trim().slice(0,150)}`:null)
.filter(Boolean);


if(hits.length){

console.log("\n--- "+k+" ---");

hits.slice(0,10)
.forEach(x=>console.log(x));

}

});


});


console.log(`
=========================================
MAP COMPLETE
=========================================
`);

