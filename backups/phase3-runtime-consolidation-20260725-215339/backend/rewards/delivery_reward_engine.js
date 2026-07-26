

const config={

baseReward:5,

deliveryBonus:2,

currency:"THB"

};


function calculate(delivery){

return {

task:delivery.id,

driver:delivery.driver,

reward:
config.baseReward +
config.deliveryBonus,

currency:config.currency,

status:"PENDING"

};

}


module.exports={
calculate
};

