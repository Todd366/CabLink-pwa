

(function(){


window.CABLINK_RIDE_STATE={


states:[
"REQUESTED",
"ACCEPTED",
"ARRIVING",
"PICKED_UP",
"STARTED",
"COMPLETED",
"CANCELLED"
],



current:
localStorage.getItem("cablink_ride_state")
||
"REQUESTED",



set:function(state){


if(!this.states.includes(state)){

console.log(
"Invalid ride state:",
state
);

return;

}


this.current=state;


localStorage.setItem(
"cablink_ride_state",
state
);



console.log(
"🚕 Ride state:",
state
);



window.dispatchEvent(

new CustomEvent(
"cablinkRideStateChanged",
{
detail:{
state:state
}
}

)

);


},



get:function(){

return this.current;

}



};



window.addEventListener(
"cablinkRideStateChanged",
function(e){

console.log(
"Ride lifecycle update:",
e.detail.state
);

});



})();
