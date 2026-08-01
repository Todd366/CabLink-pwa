

const trigger=require("./auto_reward_trigger");


function completeDelivery(task){

task.status="COMPLETED";


return trigger.processCompletion(task);

}


module.exports={
completeDelivery
};

