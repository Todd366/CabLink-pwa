
global.window={};

global.document={
addEventListener:function(){},
getElementById:function(){return null},
querySelectorAll:function(){return []}
};


require("./fare_engine.js");

require("./frontend/js/financial_intelligence.js");


console.log(`
=================================
🚕 CABLINK FINANCIAL TEST
=================================
`);


[5,10,20,50].forEach(km=>{

let fare=
window.calculateFare(
km,
"standard",
1
);


let money=
window.CABLINK_FINANCE.calculate(
fare.total
);


console.log(`

Distance: ${km} km

Customer:
P${money.customerPayment}

Driver:
P${money.driverPayout}

Platform:
P${money.platformRevenue}

Reserve:
P${money.operationsReserve}

THB:
${money.thbReward}

`);

});


