const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK RUNTIME CONNECTION AUDIT
=========================================
`);

let targets=[
"frontend/index.html",
"frontend/main.jsx",
"frontend/js/app.js",
"frontend/js/core.js",
"frontend/js/role.js",
"frontend/js/ride_engine.js",
"frontend/js/simulation_engine.js",
"frontend/screens/driver_control_screen.js",
"frontend/screens/passenger_dashboard.js"
];


function check(file){

if(fs.existsSync(file)){

let data=fs.readFileSync(file,"utf8");

console.log("\n✅",file);

let imports=data.match(/import .* from .*|require\\(.*\\)/g);

if(imports){
console.log(" CONNECTIONS:");
imports.slice(0,10).forEach(x=>console.log("  ",x));
}

let exports=data.match(/export .*|module.exports/g);

if(exports){
console.log(" EXPORTS:");
exports.slice(0,10).forEach(x=>console.log("  ",x));
}

}else{

console.log("\n❌ MISSING",file);

}

}


targets.forEach(check);



console.log(`
=========================================
BACKEND ROUTES
=========================================
`);

function scanBackend(dir){

if(!fs.existsSync(dir)) return;

fs.readdirSync(dir).forEach(f=>{

let p=path.join(dir,f);

if(fs.statSync(p).isDirectory())
scanBackend(p);

else if(f.endsWith(".js")){

let d=fs.readFileSync(p,"utf8");

if(d.includes("app.get")
||d.includes("app.post")
||d.includes("router.get")
||d.includes("router.post")){

console.log("API:",p);

}

}

});

}

scanBackend("backend");


console.log(`
=========================================
AUDIT COMPLETE
=========================================
`);

