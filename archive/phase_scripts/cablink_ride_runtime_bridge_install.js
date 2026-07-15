const fs=require("fs");

let file="index.html";

let code=fs.readFileSync(file,"utf8");

if(code.includes("CABLINK_RIDE_RUNTIME_BRIDGE")){
console.log("Already installed");
process.exit();
}

let patch=`

<script>

// =========================================
// CABLINK_RIDE_RUNTIME_BRIDGE
// =========================================

const oldBookRide = window.bookRide;


window.bookRide = async function(){

console.log(
"🚕 Sending real ride request..."
);


let payload={

pickup:
document.getElementById("pickup")?.value,

dropoff:
document.getElementById("dropoff")?.value,

fare:
STATE.selectedFare,

type:
STATE.selectedRideType,

timestamp:
Date.now()

};


try{

let r=await fetch(
"/api/rides",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(payload)
}
);


let data=await r.json();


console.log(
"🚕 Backend ride created",
data
);


}catch(e){

console.log(
"Backend ride unavailable",
e
);

}


// keep existing UI
return oldBookRide.apply(this,arguments);

};


console.log(
"🚕 Ride reality bridge active"
);


</script>

`;

code=code.replace(
"</body>",
patch+"</body>"
);


fs.writeFileSync(file,code);

console.log(
"✅ Ride backend bridge installed"
);

