const fs=require("fs");

console.log(`
=========================================
🚕 REMOVE FAKE RIDE ENGINE
=========================================
`);

let file="index.html";

let code=fs.readFileSync(file,"utf8");


if(code.includes("CABLINK_REAL_ONLY_MODE")){
console.log("Already installed");
process.exit();
}


let patch=`

<script>

// =========================================
// CABLINK_REAL_ONLY_MODE
// =========================================


window.CABLINK_REAL_ONLY_MODE=true;



window.bookRide = async function(){


console.log(
"🚕 REAL MODE BOOKING"
);


let payload={

pickup:
document.getElementById("pickup")?.value || "Unknown",

dropoff:
document.getElementById("dropoff")?.value || "Unknown",

fare:
STATE.selectedFare,

rideType:
STATE.selectedRideType,

driverMode:
true,

time:
Date.now()

};


try{


let response=await fetch(
"/api/rides",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(payload)
}
);


let data=await response.json();


console.log(
"REAL BACKEND RESPONSE",
data
);



toast(
"🚕 Ride sent to CabLink network",
"success"
);



}catch(e){

console.log(
"Backend unavailable",
e
);

toast(
"Backend connection failed",
"error"
);

}


};


console.log(
"🚕 Fake ride engine replaced"
);


</script>

`;


code=code.replace(
"</body>",
patch+"</body>"
);


fs.writeFileSync(file,code);


console.log(
"✅ Real-only ride mode installed"
);

