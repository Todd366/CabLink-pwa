

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

