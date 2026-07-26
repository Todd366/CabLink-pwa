
const payment=require("../payments/payment_engine");
const reward=require("../rewards/thb_service");


function settle(data){

return {

payment:
payment.createPayment({
ride:data.ride,
amount:data.amount
}),

reward:
reward.recordPendingReward({
ride:data.ride,
wallet:data.wallet,
amount:data.reward
}),

status:"SETTLEMENT_RECORDED"

};

}


module.exports={settle};
