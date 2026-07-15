const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK GEO FS IMPORT FIX
=========================================
`);

const file="beta/geo/tests/geo_test.js";

if(!fs.existsSync(file)){

console.log("❌ Geo test missing");
process.exit(1);

}


let code=fs.readFileSync(file,"utf8");


if(!code.includes('const fs=require("fs");')){

code=
'const fs=require("fs");\n'+code;

fs.writeFileSync(
file,
code
);

console.log("✅ fs module added");

}else{

console.log("✅ fs already exists");

}


