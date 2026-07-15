

function createReward(data){

return {

token:"THB",

amount:data.amount,

status:"READY_FOR_CONTRACT_TRANSFER",

wallet:data.wallet || null

};

}


module.exports={createReward};

