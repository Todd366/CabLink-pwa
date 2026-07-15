const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER ACCEPT TRUTH FIX
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");


// Show current function area

const start=code.indexOf("async function acceptRealRequest");

if(start!==-1){

console.log("✅ Found acceptRealRequest");

const preview=code.substring(start,start+600);

console.log(`
CURRENT:

${preview}
`);

}


// Replace old endpoint

const old=`fetch('/api/rides/' + rideId, {`;

const replacement=`fetch('/api/rides/' + rideId + '/accept', {`;

if(code.includes(old)){

code=code.replace(old,replacement);

console.log("✅ Changed driver accept endpoint");

}
else{

console.log("⚠️ Old endpoint pattern not found");

}


// Replace method if needed

code=code.replace(
"method:'POST'",
"method:'PATCH'"
);

code=code.replace(
"method: 'POST'",
"method: 'PATCH'"
);


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

Driver lifecycle now targets:

PATCH /api/rides/:id/accept

=========================================
`);

