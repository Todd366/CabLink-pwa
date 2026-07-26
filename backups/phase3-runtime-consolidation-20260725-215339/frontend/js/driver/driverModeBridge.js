
(function(){

window.CABLINK_DRIVER={

online:
localStorage.getItem("cablink_driver_online")==="true",


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
.then(console.log)
.catch(console.log);

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

const box=document.getElementById(
"driverOnlineStatus"
);

if(box){

box.textContent=
this.online
?
"🚗 Driver Online"
:
"⚪ Driver Offline";

}

}

};



function createDriverPanel(){

if(document.getElementById("driverModePanel"))
return;


const panel=document.createElement("div");

panel.id="driverModePanel";

panel.style.position="fixed";
panel.style.bottom="20px";
panel.style.right="12px";
panel.style.zIndex="9999";
panel.style.background="white";
panel.style.padding="12px";
panel.style.borderRadius="12px";
panel.style.boxShadow="0 3px 15px rgba(0,0,0,.2)";
panel.style.fontFamily="sans-serif";


panel.innerHTML=
'<div id="driverOnlineStatus">⚪ Driver Offline</div>'+
'<button id="driverOnlineBtn">Go Online</button>';


document.body.appendChild(panel);


document.getElementById(
"driverOnlineBtn"
)
.onclick=function(){

if(window.CABLINK_DRIVER.online){

window.CABLINK_DRIVER.goOffline();

this.textContent="Go Online";

}else{

window.CABLINK_DRIVER.goOnline();

this.textContent="Go Offline";

}

};


window.CABLINK_DRIVER.updateUI();

}



window.addEventListener(
"cablinkRoleChanged",
function(e){

if(e.detail.role==="DRIVER"){

createDriverPanel();

}

});



})();
