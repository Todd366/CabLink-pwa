

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

