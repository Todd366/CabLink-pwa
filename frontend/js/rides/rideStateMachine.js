(function(){

window.CABLINK_RIDE_STATE = {

current:
localStorage.getItem(
"cablink_ride_state"
)
||
"REQUESTED",


sync:function(state){

this.current = state;

localStorage.setItem(
"cablink_ride_state",
state
);

console.log(
"[CABLINK DISPLAY STATE]",
state
);

},


get:function(){

return this.current;

}

};



window.addEventListener(
"cablinkRideStateChanged",
function(e){

if(
e.detail &&
e.detail.state
){

window.CABLINK_RIDE_STATE.sync(
e.detail.state
);

}

});


})();
