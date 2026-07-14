

window.CABLINK_LOCATION={

current:null,

update:function(position){

this.current={
lat:position.lat,
lng:position.lng,
time:new Date().toISOString()
};

return this.current;

},

get:function(){

return this.current;

}

};

console.log("📍 GPS Engine ready");

