global.window={};

global.document={
 addEventListener:function(){},
 getElementById:function(){return null;},
 querySelectorAll:function(){return [];}
};

require("./fare_engine.js");


console.log(`
==================================
🚕 CABLINK DRIVER PROFIT AUDIT
==================================
`);


[5,10,20,50].forEach(km=>{

let fare=window.calculateFare(
 km,
 "standard",
 1
);


let fuel=fare.fuel;
let maintenance=fare.maint;


let driverIncome=
fare.total * 0.25;


let driverProfit=
driverIncome-fuel-maintenance;


console.log(`
Distance:
${km} km

Customer pays:
P${fare.total}

Driver income:
P${driverIncome.toFixed(2)}

Fuel:
P${fuel}

Maintenance:
P${maintenance}

Driver real profit:
P${driverProfit.toFixed(2)}

`);
});


console.log(`
==================================
Driver Profit Audit Complete
==================================
`);
