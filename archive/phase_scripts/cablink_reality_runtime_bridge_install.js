const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REALITY RUNTIME BRIDGE
=========================================
`);

let file="index.html";

if(!fs.existsSync(file)){
 console.log("❌ index.html missing");
 process.exit(1);
}

let code=fs.readFileSync(file,"utf8");

fs.copyFileSync(
 file,
 file+".backup_reality_"+Date.now()
);


if(code.includes("CABLINK_REALITY_RUNTIME_BRIDGE")){
 console.log("✅ Bridge already installed");
 process.exit(0);
}


let bridge=`

<script>

// =========================================
// CABLINK_REALITY_RUNTIME_BRIDGE
// =========================================

window.CABLINK_RUNTIME={
    ride:null,
    drivers:[],
    connected:true
};


// Load real driver availability

async function loadRealDrivers(){

try{

let r=await fetch("/api/drivers/online");

if(r.ok){

let data=await r.json();

window.CABLINK_RUNTIME.drivers=data;

let el=document.getElementById("mapDriverCount");

if(el){

el.textContent =
data.length+
" drivers online";

}

}

}catch(e){

console.log(
"Driver API waiting..."
);

}

}


// Send real ride request

async function createRealRide(payload){

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
"🚕 REAL RIDE:",
data
);


window.CABLINK_RUNTIME.ride=data.ride;


return data.ride;


}catch(e){

console.error(
"Ride connection failed",
e
);

}

}


// Replace fake nearby count

document.addEventListener(
"DOMContentLoaded",
()=>{

loadRealDrivers();

});


// Expose bridge

window.CabLinkReality={
drivers:loadRealDrivers,
ride:createRealRide
};


console.log(
"🚕 Reality bridge active"
);


</script>

`;


let marker="</body>";

code=code.replace(
marker,
bridge+marker
);


fs.writeFileSync(
file,
code
);


console.log(
"✅ Reality bridge installed"
);

console.log(
"✅ Backup created"
);

console.log(`
Next:
restart frontend
`);

