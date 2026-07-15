
const config=require("./thb_config");
const store=require("../../database/production/store_engine");


async function processReward(reward){


if(!config.contract){

return {

status:"WAITING_CONFIGURATION",

reason:"CONTRACT_ADDRESS missing"

};

}


let transaction={

reward:reward.id,

status:"READY_FOR_TRANSFER",

contract:config.contract,

time:new Date().toISOString()

};


store.save(
"blockchain_transactions",
transaction
);


return transaction;

}


module.exports={
processReward
};

