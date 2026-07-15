const fs=require("fs");

console.log(`
=========================================
🚕 MOUNT DRIVER ONLINE ROUTE
=========================================
`);

let file="backend/server.js";

if(!fs.existsSync(file)){
 console.log("❌ server.js missing");
 process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


if(code.includes("driver_online_api")){

console.log("✅ Already mounted");
process.exit(0);

}


// add import near other routes

let importLine=`
const driverOnlineAPI=require("./routes/driver_online_api");
`;


let anchor='const identityAPI=require("./routes/identity_api");';


if(code.includes(anchor)){

code=code.replace(
anchor,
anchor+importLine
);

}else{

code=importLine+code;

}


// mount before server listen

let mountLine=`

// Driver online reality bridge
app.use("/api",driverOnlineAPI);
`;


let listenIndex=code.indexOf("app.listen");


if(listenIndex!==-1){

code=
code.slice(0,listenIndex)
+
mountLine
+
code.slice(listenIndex);

}else{

code+=mountLine;

}


fs.writeFileSync(file,code);


console.log("✅ Driver online route mounted");
console.log("backend/server.js updated");

