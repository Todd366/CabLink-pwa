global.window={};

global.document={
 addEventListener:function(){},
 getElementById:function(){
   return null;
 },
 querySelectorAll:function(){
   return [];
 }
};

require("./fare_engine.js");


console.log(`
==================================
🚕 CABLINK MONEY FLOW AUDIT
==================================
`);


let rides=[
5,
10,
20
];


rides.forEach(km=>{

let fare=window.calculateFare(
 km,
 "standard",
 1
);


let driver=
fare.total * window.FARE_CONFIG.driverMargin;


let platform=
fare.total * window.FARE_CONFIG.platformFee;


let operating=
fare.total-driver-platform;


console.log(`
Distance: ${km} km

Customer pays:
P${fare.total}

Driver share:
P${driver.toFixed(2)}

Platform fee:
P${platform.toFixed(2)}

Remaining operating pool:
P${operating.toFixed(2)}

`);
});


console.log(`
==================================
Money Audit Complete
==================================
`);
