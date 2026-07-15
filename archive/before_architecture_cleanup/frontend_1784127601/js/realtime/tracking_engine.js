

window.CABLINK_TRACKING={


ride:null,


start:function(data){

this.ride=data;

return {
status:"TRACKING_ACTIVE",
ride:data.id
};

},


updateDriver:function(location){

this.driverLocation=location;

return location;

},


getDriver:function(){

return this.driverLocation;

}


};


console.log("🚕 Live Tracking Engine ready");

