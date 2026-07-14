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
🚕 CABLINK FARE ENGINE TEST
==================================
`);

const tests=[
 {km:1,type:"standard",surge:1},
 {km:5,type:"standard",surge:1},
 {km:10,type:"standard",surge:1},
 {km:20,type:"xl",surge:1},
 {km:5,type:"moto",surge:1},
 {km:10,type:"standard",surge:1.5}
];


tests.forEach(t=>{

let r=window.calculateFare(
 t.km,
 t.type,
 t.surge
);

console.log(`
Distance: ${r.km} km
Vehicle: ${r.type}
Fuel cost: ${r.fuel} BWP
Maintenance: ${r.maint} BWP
Total fare: ${r.total} ${r.currency}
ETA: ${r.eta} minutes
Surge: ${r.surge}x
`);

});


console.log(`
==================================
Fare Test Complete
==================================
`);
