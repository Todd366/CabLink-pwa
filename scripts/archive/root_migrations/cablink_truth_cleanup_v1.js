const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK TRUTH CLEANUP ENGINE v1
=========================================
`);

const files=[
"frontend/index.html",
"frontend/js/app.js"
];

const archive="archive/truth_cleanup_"+Date.now();

fs.mkdirSync(archive,{recursive:true});

files.forEach(file=>{

if(fs.existsSync(file)){

let backup=archive+"/"+file.replace(/\//g,"_");

fs.copyFileSync(file,backup);

console.log("✅ Backup:",file);

}

});


let html=fs.readFileSync("frontend/index.html","utf8");

const removals=[

"drivers nearby",
"simulateRide",
"Simulate ride",
"Requesting ride",
"Math.random()*3)+2",
"addDriverRequest"

];


removals.forEach(x=>{

if(html.includes(x)){
console.log("⚠️ Found fake/demo logic:",x);
}

});


console.log(`
=========================================
Backup created.
Next phase: extract real modules.
=========================================
`);

