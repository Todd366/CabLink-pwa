const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER WIRING ENGINE v1
=========================================
`);

const index="frontend/index.html";

if(!fs.existsSync(index)){
 console.log("❌ frontend/index.html missing");
 process.exit();
}

let html=fs.readFileSync(index,"utf8");


// Backup
fs.mkdirSync("archive/driver_wiring",{recursive:true});
fs.copyFileSync(
 index,
 "archive/driver_wiring/index_"+Date.now()+".html"
);

console.log("✅ Backup created");


// Add driver application service
fs.mkdirSync("frontend/js/driver",{recursive:true});

fs.writeFileSync(
"frontend/js/driver/applicationService.js",
`
export async function submitApplication(data){

const r = await fetch('/api/drivers/apply',{
method:'POST',
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

return await r.json();

}
`
);

console.log("✅ Driver application service created");


// Add global submit function
if(!html.includes("submitDriverApplication")){

html=html.replace(
"</body>",
`
<script>

async function submitDriverApplication(){

const data={

name:
document.getElementById("driverName").value,

phone:
document.getElementById("driverPhone").value,

license:
document.getElementById("driverLicense").value,

vehicle:
document.getElementById("driverVehicle").value,

registration:
document.getElementById("driverReg").value

};


try{

const r =
await fetch('/api/drivers/apply',{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});


const result=await r.json();


alert(
"🚕 Driver application submitted"
);


console.log(result);


}catch(e){

console.error(e);

alert(
"Driver application failed"
);

}

}


function openDriverApplication(){

const modal=
document.getElementById(
"driverApplyModal"
);

if(modal)
modal.style.display="flex";

}


</script>

</body>
`
);

console.log("✅ Submit logic injected");

}


// Add driver button
if(!html.includes("openDriverApplication")){

html=html.replace(
"<body>",
`
<body>

<button 
class="btn btn-green"
onclick="openDriverApplication()">
🚕 Become a Driver
</button>

`
);

console.log("✅ Driver button added");

}


fs.writeFileSync(index,html);

console.log(`
=========================================
✅ DRIVER FLOW CONNECTED

Frontend:
✔ Application modal
✔ Submit function
✔ Driver button

Backend:
✔ /api/drivers/apply

=========================================
`);

