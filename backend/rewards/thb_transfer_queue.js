
const store=require("../../database/production/store_engine");


function queueReward(data){

let reward={

id:"THB-"+Date.now(),

ride:data.ride,

wallet:data.wallet,

amount:data.amount,

status:"QUEUED",

created:new Date().toISOString()

};


store.save(
"thb_queue",
reward
);


return reward;

}


module.exports={
queueReward
};

