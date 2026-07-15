global.window={};

global.document={
 addEventListener:function(){},
 getElementById:function(){return null;},
 querySelectorAll:function(){return [];}
};

require("./fare_engine.js");


console.log(`
==================================
🚕 CABLINK MARKET FARE AUDIT
==================================
`);


[3,5,10,20].forEach(km=>{

let fare=window.calculateFare(
 km,
 "standard",
 1
);


console.log(`
Distance:
${km} km

CabLink Fare:
P${fare.total}

Estimated per km:
P${(fare.total/km).toFixed(2)}

`);
});


console.log(`
==================================
Market Audit Complete
==================================
`);
