
global.window={};

require("./frontend/js/operations_core.js");


console.log(`
=================================
🚕 OPERATIONS CORE TEST
=================================
`);


let ride={

id:"CL-001",

fare:68,

status:"TRIP_ACTIVE"

};


let tx=
window.CABLINK_OPS.createTransaction(ride);


console.log(tx);



let dispatch=
window.CABLINK_OPS.dispatch(
ride,
[
{
id:"DRV001",
name:"Test Driver"
}
]
);


console.log(dispatch);


console.log(`
=================================
TEST COMPLETE
=================================
`);

