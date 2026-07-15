const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SERVER IMPORT SYNCHRONIZER
=========================================
`);

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


let routesDir="backend/routes";


let routeFiles=fs.readdirSync(routesDir)
.filter(f=>f.endsWith(".js"));


let added=0;


for(const f of routeFiles){

let name=
f.replace(".js","")
.replace(/(^|_)(\w)/g,(m,a,b)=>b.toUpperCase());


let variable=name
.charAt(0).toLowerCase()
+name.slice(1);


let mountRegex=
new RegExp(
`app\\.use\\(["']\\/api["'],\\s*${variable}\\s*\\)`
);


if(mountRegex.test(code)){


let importLine=
`const ${variable}=require("./routes/${f}");`;


if(!code.includes(importLine)){


code=
importLine+"\n"+code;


console.log(
"✅ Restored:",
importLine
);


added++;

}


}

}


fs.writeFileSync(file,code);


console.log(`
=========================================
Added imports: ${added}
=========================================
`);

