const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK DRIVER MODE BRIDGE INSTALLER
=========================================
`);

function exists(f){
    return fs.existsSync(f);
}

console.log("\n---- BACKEND DISCOVERY ----");

[
"backend/routes/driver_online_api.js",
"backend/routes/driver_dashboard_api.js",
"backend/services/driver_service.js",
"backend/services/driver_matching_service.js",
"backend/server.js"
].forEach(f=>{
    console.log(exists(f)?"✅ "+f:"⚠️ "+f);
});


const bridgeFile="frontend/js/driver/driverModeBridge.js";

const bridge = `
(function(){

window.CABLINK_DRIVER={

online:false,

goOnline:function(){

this.online=true;

localStorage.setItem(
"cablink_driver_online",
"true"
);

this.updateUI();

fetch("/api/drivers/online",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
driverId:
localStorage.getItem("cablink_driver_id")
||
"demo-driver",
online:true
})
})
.then(r=>r.json())
.then(data=>{
console.log("Driver online:",data);
})
.catch(err=>{
console.log("Driver API:",err.message);
});

},


goOffline:function(){

this.online=false;

localStorage.setItem(
"cablink_driver_online",
"false"
);

this.updateUI();

fetch("/api/drivers/offline",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
driverId:
localStorage.getItem("cablink_driver_id")
||
"demo-driver"
})
})
.catch(()=>{});

},


updateUI:function(){

let box=document.getElementById(
"driverOnlineStatus"
);

if(box){

box.textContent=this.online
?
"🟢 Driver Online"
:
"⚪ Driver Offline";

}

}

};



window.addEventListener(
"cablinkRoleChanged",
function(e){

if(e.detail.role!=="DRIVER")
return;


let panel=document.getElementById(
"driverModePanel"
);


if(!panel){

panel=document.createElement("div");

panel.id="driverModePanel";

panel.style="
position:fixed;
bottom:20px;
right:12px;
z-index:9999;
background:white;
padding:12px;
border-radius:12px;
box-shadow:0 3px 15px rgba(0,0,0,.2);
font-family:sans-serif;
";


panel.innerHTML =
'<div id="driverOnlineStatus">⚪ Driver Offline</div>'+
'<button id="driverOnlineBtn">Go Online</button>';


document.body.appendChild(panel);


document.getElementById(
"driverOnlineBtn"
).onclick=function(){

if(window.CABLINK_DRIVER.online){

window.CABLINK_DRIVER.goOffline();

this.textContent="Go Online";

}else{

window.CABLINK_DRIVER.goOnline();

this.textContent="Go Offline";

}

};

}

});



if(
localStorage.getItem("cablink_driver_online")
==="true"
){

window.CABLINK_DRIVER.online=true;

}


})();
`;


if(!exists(bridgeFile)){

fs.writeFileSync(
bridgeFile,
bridge
);

console.log("✅ Driver bridge created");

}else{

console.log("✅ Driver bridge already exists");

}



let index="index.html";

let html=fs.readFileSync(index,"utf8");

const script=
'<script src="frontend/js/driver/driverModeBridge.js"></script>';

if(!html.includes("driverModeBridge.js")){

html=html.replace(
"</body>",
script+"\n</body>"
);

fs.writeFileSync(index,html);

console.log("✅ Driver bridge loaded");

}else{

console.log("✅ Driver bridge already loaded");

}



console.log(`
---- SYNTAX CHECK ----
`);

execSync(
"node --check frontend/js/driver/driverModeBridge.js",
{
stdio:"inherit"
}
);

console.log("✅ Syntax OK");


console.log(`
---- COMMIT ----
`);

try{

execSync(
'git add index.html frontend/js/driver/driverModeBridge.js && git commit -m "feat: connect driver mode availability bridge"',
{
stdio:"inherit"
}
);

}catch(e){

console.log("Nothing new to commit");

}


console.log(`
=========================================
DONE

Driver Mode bridge ready.

ROLE SWITCH
     ↓
DRIVER MODE
     ↓
ONLINE BUTTON
     ↓
DRIVER API

=========================================
`);

