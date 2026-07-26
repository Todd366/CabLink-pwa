

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

