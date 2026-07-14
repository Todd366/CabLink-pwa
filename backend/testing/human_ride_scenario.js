
const payment=require("../payments/payment_engine");
const safety=require("../safety/emergency_engine");
const fraud=require("../fraud/ride_validation");
const reward=require("../fraud/reward_guard");


console.log({

rideValidation:
fraud.validate({

passenger:"P001",
driver:"D001",
distance:8

}),

payment:
payment.confirm({

ride:"RIDE001",
amount:50

}),

reward:
reward.check({

completed:true

}),

emergency:
safety.trigger({

ride:"RIDE001",
user:"P001",
location:"Gaborone"

})

});

