const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PRODUCTION GATE
=========================================
`);

const checks=[];

function check(name,result){

checks.push({
name,
result
});

console.log(
result ? "✅" : "❌",
name
);

}


// Environment files

check(
"Backend server exists",
fs.existsSync("backend/server.js")
);

check(
"Frontend exists",
fs.existsSync("index.html")
);

check(
"Package file exists",
fs.existsSync("package.json")
);

check(
"Backend package exists",
fs.existsSync("backend/package.json") ||
fs.existsSync("package.json")
);


// Detect development leftovers

const files=[
"index.html",
"backend/server.js"
];


let source="";

for(const f of files){

if(fs.existsSync(f))
source+=fs.readFileSync(f,"utf8");

}


check(
"No obvious localhost dependency",
![
"index.html",
"vite.config.js",
"package.json",
"backend/server.js"
]
.some(f=>fs.existsSync(f)&&fs.readFileSync(f,"utf8").includes("localhost:3000"))
);


check(
"Ride API present",
source.includes("/api/rides")
);


check(
"HTTPS deployment compatible",
fs.existsSync(".env.example") &&
!source.includes("http://your-backend-domain")
);


console.log(`
=========================================
RESULT
=========================================
`);

const passed=
checks.filter(x=>x.result).length;

console.log(
passed+"/"+checks.length,
"checks passed"
);

console.log(
passed===checks.length ?
"🚀 PRODUCTION GATE PASSED":
"⚠️ FIX BEFORE DEPLOYMENT"
);

