

const rewardEngine=require("./delivery_reward_engine");
const history=require("./reward_history");


function processCompletion(task){

if(task.status!=="COMPLETED"){

return {

status:"IGNORED",

reason:"Task not completed"

};

}


const reward=
rewardEngine.calculate(task);


history.add(reward);


return {

status:"REWARDED",

reward

};

}


module.exports={
processCompletion
};

