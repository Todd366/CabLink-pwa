const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER MODE REALITY PATCH
=========================================
`);

let file="index.html";

let code=fs.readFileSync(file,"utf8");


if(code.includes("CABLINK_DRIVER_REALITY_PATCH")){
console.log("✅ Already installed");
process.exit(0);
}


fs.copyFileSync(
file,
file+".backup_driver_patch_"+Date.now()
);


let patch=`

<script>

// =========================================
// CABLINK_DRIVER_REALITY_PATCH
// =========================================


const originalToggleDriverMode = window.toggleDriverMode;


window.toggleDriverMode = async function(){


STATE.driverOnline = !STATE.driverOnline;


const btn=document.getElementById("driverModeBtn");


if(STATE.driverOnline){


btn.textContent="🔴 Go offline";

btn.className=
"btn btn-sm btn-danger";


let driver={

id:
localStorage.getItem("cablink_driver_id")
||
"DRV-"+Date.now(),

name:
"CabLink Driver",

location:
"Gaborone",

timestamp:
Date.now()

};


localStorage.setItem(
"cablink_driver_id",
driver.id
);



try{


let r=await fetch(
"/api/drivers/online",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(driver)
}
);


let data=await r.json();


console.log(
"🚗 Driver LIVE:",
data
);


toast(
"Driver is LIVE on network",
"success"
);


}catch(e){

console.log(
"Driver backend unavailable"
);

}


}else{


btn.textContent="🚗 Go online";

btn.className=
"btn btn-sm btn-outline";


let id=
localStorage.getItem(
"cablink_driver_id"
);


fetch(
"/api/drivers/offline",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
id
})
}
);


toast(
"Driver offline",
"warning"
);


}


updateDriverUI();

};


console.log(
"🚕 Driver reality patch active"
);


</script>

`;


code=code.replace(
"</body>",
patch+"</body>"
);


fs.writeFileSync(
file,
code
);


console.log(
"✅ Driver mode connected to backend"
);

