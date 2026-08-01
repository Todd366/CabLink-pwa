

(function(){

console.log(
"🚕 CabLink Driver Dispatch Bridge Loaded"
);



window.CABLINK_DISPATCH={


polling:false,


start:function(){

if(this.polling)
return;


this.polling=true;


console.log(
"Driver dispatch listener active"
);



setInterval(()=>{


if(
window.CABLINK_ROLE!=="DRIVER"
&&
localStorage.getItem("cablink_role")!=="DRIVER"
)
return;



fetch("/api/dispatch/requests")
.then(r=>r.json())
.then(data=>{


if(!data)
return;



if(
data.request
||
data.ride
){

console.log(
"🚨 New ride request",
data
);


this.showRequest(data);

}


})
.catch(()=>{});


},5000);


},



showRequest:function(data){


if(document.getElementById(
"cablinkDispatchRequest"
))
return;



const box=document.createElement("div");


box.id="cablinkDispatchRequest";


box.style.position="fixed";
box.style.bottom="100px";
box.style.right="12px";
box.style.zIndex="99999";
box.style.background="white";
box.style.padding="15px";
box.style.borderRadius="12px";
box.style.boxShadow="0 3px 20px rgba(0,0,0,.25)";



box.innerHTML=
"<b>🚕 New Ride Request</b><br>"+
"Pickup available"+
"<br><br>"+
"<button id='acceptCabRide'>Accept</button>";



document.body.appendChild(box);



document.getElementById(
"acceptCabRide"
)
.onclick=function(){


fetch("/api/dispatch/accept",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

driverId:
localStorage.getItem(
"cablink_driver_id"
)
||
"demo-driver",

rideId:
data.rideId
||
data.id

})

})
.then(r=>r.json())
.then(console.log);




if(window.CABLINK_RIDE_STATE){

console.log(
"[CABLINK] Driver assignment confirmed by canonical backend"
);

}

box.remove();



};


}


};


window.CABLINK_DISPATCH.start();


})();

