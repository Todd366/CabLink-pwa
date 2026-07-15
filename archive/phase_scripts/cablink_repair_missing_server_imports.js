const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SERVER IMPORT REPAIR
=========================================
`);

let file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const fixes={

"identityAPI":
'const identityAPI=require("./routes/identity_api");',

"ridesAPI":
'const ridesAPI=require("./routes/rides");'

};


for(const [name,line] of Object.entries(fixes)){


if(code.includes(`app.use("/api", ${name})`) &&
!code.includes(`const ${name}=`)){


let anchor='const driverOnlineAPI=require("./routes/driver_online_api");';


if(code.includes(anchor)){

code=code.replace(
anchor,
anchor+"\n"+line
);

console.log(
"✅ Restored import:",
name
);


}else{

code=line+"\n"+code;

console.log(
"✅ Added import at top:",
name
);

}

}


}


fs.writeFileSync(file,code);


console.log(`
=========================================
CHECKING SYNTAX
=========================================
`);

