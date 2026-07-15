const fs=require("fs");

const file="index.html";

let code=fs.readFileSync(file,"utf8");

const backup="index_backup_before_real_engine.html";
fs.writeFileSync(backup,code);

console.log("Backup:",backup);


// Replace bookRide body
const start=code.indexOf("function bookRide(){");

if(start===-1){
 console.log("❌ bookRide not found");
 process.exit();
}


let end=code.indexOf("\n}",start)+2;


const realBook=`

async function bookRide(){

console.log("🚕 REAL BOOKING ENGINE");

let payload={

pickup:
document.getElementById("pickup")?.value || "Unknown",

dropoff:
document.getElementById("dropoff")?.value || "Unknown",

fare:
STATE.selectedFare || 0,

type:
STATE.selectedRideType || "standard",

timestamp:
Date.now()

};


try{

let response=await fetch("/api/rides",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(payload)

});


let data=await response.json();


console.log("REAL RIDE CREATED:",data);


STATE.rideId=data.ride?.id || Date.now();

toast(
"🚕 Driver network request sent",
"success"
);


}catch(e){

console.error(e);

toast(
"Backend unavailable",
"error"
);

}


}


`;

code=
code.slice(0,start)+
realBook+
code.slice(end);



// Disable fake simulation button

code=code.replace(
'onclick="simulateRide()"',
'onclick="bookRide()"'
);


fs.writeFileSync(file,code);


console.log(`
================================
REAL ENGINE PATCH COMPLETE
================================

Removed fake bookRide()
Connected booking to /api/rides

Next:
restart Vite

`);
