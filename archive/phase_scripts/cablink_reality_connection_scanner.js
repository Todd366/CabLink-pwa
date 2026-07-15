const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK REALITY CONNECTION SCANNER
=========================================
`);

let keywords=[
"driver",
"Driver",
"online",
"offline",
"approve",
"approval",
"register",
"dispatch",
"match",
"nearby",
"simulate",
"mock",
"fake",
"STATE",
"ride",
"reward",
"claim"
];


function scan(dir){

let files=fs.readdirSync(dir);

files.forEach(file=>{

let full=path.join(dir,file);

let stat=fs.statSync(full);


if(stat.isDirectory()
&& !full.includes("node_modules")
&& !full.includes("dist")
&& !full.includes(".git")){

scan(full);

}


if(stat.isFile()
&& full.endsWith(".js")){


let data=fs.readFileSync(full,"utf8");

let found=[];


keywords.forEach(k=>{

if(data.includes(k))
found.push(k);

});


if(found.length){

console.log("\nFILE:",full);

console.log(
"FOUND:",
found.join(", ")
);

}


}

});

}


scan(".");


console.log(`
=========================================
SCAN COMPLETE
=========================================
`);

