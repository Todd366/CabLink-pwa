

const reward=require("./delivery_reward_engine");


function complete(task){

task.status="COMPLETED";

return reward.calculate(task);

}


module.exports={
complete
};

