const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FRONTEND RIDE TRUTH BRIDGE
=========================================
`);

const files=[
"index.html",
"frontend/index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"fix.js"
];


let target=null;

for(const f of files){

if(fs.existsSync(f)){
target=f;
break;
}

}


if(!target){

console.log("❌ No frontend file found");
process.exit(1);

}


console.log("Using:",target);


let code=fs.readFileSync(target,"utf8");


// Add real accept function

if(!code.includes("cablinkAcceptRide")){

code += `


async function cablinkAcceptRide(rideId,driverId){

const res = await fetch(
"/api/rides/"+rideId+"/accept",
{
method:"PATCH",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
driverId:driverId
})
}
);

return await res.json();

}



async function cablinkCompleteRide(rideId){

const res = await fetch(
"/api/rides/"+rideId+"/complete",
{
method:"PATCH"
}
);

return await res.json();

}


window.cablinkAcceptRide=cablinkAcceptRide;
window.cablinkCompleteRide=cablinkCompleteRide;


`;

console.log("✅ Added real accept/complete bridge");

}
else{

console.log("✅ Bridge already exists");

}



fs.writeFileSync(target,code);


console.log(`
=========================================
COMPLETE

Frontend now has:

window.cablinkAcceptRide()

window.cablinkCompleteRide()


Next:
Connect dashboard buttons.
=========================================
`);

