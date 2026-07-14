
function createClaim(reward){

return {

wallet:reward.wallet,

amount:reward.amount,

token:"THB",

status:"READY_FOR_BLOCKCHAIN_TRANSFER",

created:new Date().toISOString()

};

}


module.exports={
createClaim
};
