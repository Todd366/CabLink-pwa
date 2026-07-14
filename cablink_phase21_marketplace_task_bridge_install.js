const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 21
BSTM MARKETPLACE TASK BRIDGE
=========================================
`);

[
"backend/ecosystem",
"backend/tasks",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// TASK DATABASE

fs.writeFileSync(
"backend/tasks/task_manager.js",
`

const tasks={};


function create(data){

const task={

id:"TASK-"+Date.now(),

source:"BSTM_MARKETPLACE",

type:data.type || "DELIVERY",

customer:data.customer,

pickup:data.pickup,

dropoff:data.dropoff,

status:"AVAILABLE",

created:new Date().toISOString()

};


tasks[task.id]=task;

return task;

}



function assign(id,driver){

if(tasks[id]){

tasks[id].driver=driver;

tasks[id].status="ASSIGNED";

}

return tasks[id];

}



function all(){

return Object.values(tasks);

}



module.exports={
create,
assign,
all
};

`
);


// MARKETPLACE BRIDGE

fs.writeFileSync(
"backend/ecosystem/marketplace_bridge.js",
`

const tasks=require("../tasks/task_manager");


function receiveOrder(order){

return tasks.create({

type:"DELIVERY",

customer:order.customer,

pickup:order.vendor,

dropoff:order.customerAddress

});

}


module.exports={
receiveOrder
};

`
);


// ROUTE

fs.writeFileSync(
"backend/routes/ecosystem_tasks.js",
`

const router=require("express").Router();

const bridge=require("../ecosystem/marketplace_bridge");
const tasks=require("../tasks/task_manager");


router.post(
"/marketplace/order",
(req,res)=>{

res.json(
bridge.receiveOrder(req.body)
);

}

);


router.get(
"/tasks",
(req,res)=>{

res.json(
tasks.all()
);

}

);


router.patch(
"/tasks/:id",
(req,res)=>{

res.json(
tasks.assign(
req.params.id,
req.body.driver
)
);

}

);


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/marketplace_bridge_test.js",
`

const bridge=require("../ecosystem/marketplace_bridge");


console.log(

bridge.receiveOrder({

customer:"USER001",

vendor:"BSTM STORE",

customerAddress:"Gaborone CBD"

})

);

`
);


console.log(`
=========================================

✅ PHASE 21 CREATED

Added:

✅ Marketplace order receiver
✅ Delivery task engine
✅ Driver assignment foundation
✅ BSTM → CabLink bridge

NEXT:

Phase 22:
Connect tasks into driver dashboard

=========================================
`);

