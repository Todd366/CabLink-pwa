

(function(){

function createStatus(){

if(document.getElementById(
"passengerRideStatus"
))
return;


const box=document.createElement("div");

box.id="passengerRideStatus";

box.style.position="fixed";
box.style.bottom="20px";
box.style.left="12px";
box.style.zIndex="9999";
box.style.background="white";
box.style.padding="12px";
box.style.borderRadius="12px";
box.style.boxShadow="0 3px 15px rgba(0,0,0,.2)";
box.style.fontFamily="sans-serif";


box.innerHTML=
"🚕 Ride Status: "+
(
window.CABLINK_RIDE_STATE
?
window.CABLINK_RIDE_STATE.get()
:
"REQUESTED"
);


document.body.appendChild(box);

}


function update(state){

const box=document.getElementById(
"passengerRideStatus"
);

if(box){

box.textContent=
"🚕 Ride Status: "+state;

}

}


window.addEventListener(
"cablinkRideStateChanged",
function(e){

createStatus();

update(
e.detail.state
);

});


createStatus();


})();

