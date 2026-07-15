const fs=require("fs");

const file="frontend/js/app.js";

console.log(`
=========================================
🚕 CABLINK REAL BOOKING BRIDGE INSTALL
=========================================
`);

if(!fs.existsSync(file)){
 console.log("❌ app.js missing");
 process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


if(code.includes("CABLINK_REAL_API_BRIDGE")){
 console.log("✅ Bridge already installed");
 process.exit(0);
}


fs.copyFileSync(
 file,
 file+".backup_"+Date.now()
);


let bridge=`

// =========================================
// CABLINK_REAL_API_BRIDGE
// =========================================

async function sendRideToBackend(ride){

try{

const response=await fetch(
"/api/rides",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(ride)
}
);


const data=await response.json();


console.log(
"🚕 Backend ride created:",
data
);


window.CABLINK_REAL_RIDE=data.ride;


}catch(error){

console.error(
"❌ Backend ride failed",
error
);

}

}

`;


code =
bridge +
code;


fs.writeFileSync(file,code);


console.log("✅ Real booking bridge added");
console.log("=========================================");

