const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 29
DRIVER ECONOMY DASHBOARD
BSTM + THB VIEW
=========================================
`);

[
"frontend/components",
"frontend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DRIVER ECONOMY DASHBOARD COMPONENT

fs.writeFileSync(
"frontend/components/driver_economy_dashboard.js",
`

function render(data){

return {

screen:"Driver Economy Dashboard",

driver:data.driver,

deliveryTasks:data.tasks || [],

earnings:{

amount:data.earnings || 0,

currency:"BWP"

},

wallet:{

balance:data.wallet || 0,

currency:"THB"

},

rewards:data.rewards || [],

status:"ACTIVE"

};

}


module.exports={
render
};

`
);


// DRIVER ECONOMY SERVICE

fs.writeFileSync(
"frontend/services/driver_economy_service.js",
`

function build(tasks,earnings,wallet,rewards){

return {

driver:"DRIVER001",

tasks,

earnings,

wallet,

rewards

};

}


module.exports={
build
};

`
);


// TEST

fs.writeFileSync(
"frontend/testing/driver_economy_dashboard_test.js",
`

const dashboard=require("../components/driver_economy_dashboard");
const service=require("../services/driver_economy_service");


const data=service.build(

[

{

id:"TASK200",

type:"DELIVERY",

status:"COMPLETED"

}

],

50,

7,

[

{

task:"TASK200",

reward:7,

currency:"THB"

}

]

);


console.log(

dashboard.render(data)

);

`
);


console.log(`
=========================================

✅ PHASE 29 CREATED

Added:

✅ Driver economy dashboard
✅ BWP earnings display
✅ THB wallet display
✅ Reward history display

RUN:

node frontend/testing/driver_economy_dashboard_test.js

NEXT:

Phase 30:
Connect live backend data into dashboard

=========================================
`);

