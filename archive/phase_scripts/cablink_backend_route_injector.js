const fs=require("fs");

const file="backend/server.js";

console.log(`
=====================================
🚕 CABLINK BACKEND ROUTE CONNECTOR
=====================================
`);

if(!fs.existsSync(file)){
    console.log("❌ backend/server.js missing");
    process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


if(code.includes("ride_api_patch")){
    console.log("✅ Ride API already connected");
    process.exit(0);
}


fs.copyFileSync(
    file,
    file+".backup_"+Date.now()
);


let inject=`

// =====================================
// CabLink Ride Reality API
// =====================================
require("./ride_api_patch")(app);

`;


/*
 Insert before server listen
*/
let marker=[
"app.listen",
"http.listen",
"server.listen"
];


let inserted=false;


for(let m of marker){

    let index=code.indexOf(m);

    if(index!==-1){

        code=
        code.slice(0,index)
        +
        inject
        +
        code.slice(index);

        inserted=true;
        break;

    }

}


if(!inserted){

    code += inject;

}


fs.writeFileSync(file,code);


console.log("✅ Ride API injected");
console.log("✅ Backup created");
console.log("=====================================");

