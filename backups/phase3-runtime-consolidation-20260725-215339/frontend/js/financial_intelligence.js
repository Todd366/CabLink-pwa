

(function(){

"use strict";


window.CABLINK_FINANCE={


calculate:function(fare){

const config=
window.FARE_CONFIG || 
{
driverMargin:0.25,
platformFee:0.10
};


let driver=
fare*config.driverMargin;


let platform=
fare*config.platformFee;


let reserve=
fare-driver-platform;


return {

customerPayment:fare,

driverPayout:
Number(driver.toFixed(2)),

platformRevenue:
Number(platform.toFixed(2)),

operationsReserve:
Number(reserve.toFixed(2)),

thbReward:1,

timestamp:new Date().toISOString()

};

}


};


console.log("💰 CabLink Financial Intelligence ready");


})();
