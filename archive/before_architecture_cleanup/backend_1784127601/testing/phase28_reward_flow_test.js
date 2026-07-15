

const service=require("../rewards/delivery_reward_service");
const wallet=require("../rewards/wallet_service");


console.log(

service.completeDelivery({

id:"TASK200",

driver:"DRIVER002"

})

);


console.log(

wallet.wallet("DRIVER002")

);

