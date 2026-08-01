
const store=require("../../database/production/store_engine");


function recordPendingReward(data){

return store.save(
"rewards",
{
ride:data.ride,
wallet:data.wallet,
amount:data.amount,
token:"THB",
status:"PENDING_CHAIN_CONFIRMATION",
time:new Date().toISOString()
}
);

}


module.exports={
recordPendingReward
};
