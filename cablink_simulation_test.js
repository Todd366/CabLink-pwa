
global.window={};

global.document={
addEventListener:function(){},
getElementById:function(){return null},
querySelectorAll:function(){return []}
};


require("./frontend/js/ride_engine.js");
require("./frontend/js/operations_core.js");
require("./frontend/js/financial_intelligence.js");


require("./frontend/js/simulation_engine.js");


console.log(`
=================================
🚕 FULL CABLINK TEST
=================================
`);


let result=
window.CABLINK_SIM.run();


console.log(`
=================================
SIMULATION COMPLETE
=================================
`);


console.log(JSON.stringify(result,null,2));

