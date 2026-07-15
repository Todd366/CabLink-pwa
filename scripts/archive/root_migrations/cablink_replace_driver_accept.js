const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER ACCEPT REAL WIRING
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");

const old=`body: JSON.stringify({ status: 'accepted', driverId: STATE.driverId })`;

const replacement=`body: JSON.stringify({ driverId: STATE.driverId })`;

if(code.includes(old)){

code=code.replace(old,replacement);

console.log("✅ Removed fake accept payload");

}
else{

console.log("⚠️ Old accept payload not found");

}


// Replace fetch target if nearby

code=code.replace(
"'/api/rides/'+req.id",
"'/api/rides/'+req.id+'/accept'"
);


fs.writeFileSync(file,code);


console.log(`
=========================================
DONE

Driver accept now points toward:

PATCH /api/rides/:id/accept

=========================================
`);

