const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK API IMPORT CAPITALIZATION FIX
=========================================
`);

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const imports={

"driverOnlineAPI":
'const driverOnlineAPI=require("./routes/driver_online_api");',

"identityAPI":
'const identityAPI=require("./routes/identity_api");',

"ridesAPI":
'const ridesAPI=require("./routes/rides");'

};


let added=0;


for(const [variable,line] of Object.entries(imports)){


if(code.includes(`app.use("/api",${variable})`) ||
code.includes(`app.use("/api", ${variable})`)){


if(!code.includes(`const ${variable}=`)){


code=line+"\n"+code;

console.log(
"✅ Added missing:",
line
);

added++;

}


}

}


fs.writeFileSync(file,code);


console.log(`
=========================================
Imports repaired: ${added}
=========================================
`);

