

const history=require("../rewards/reward_history");
const wallet=require("../rewards/wallet_service");


history.add({

task:"TASK100",

driver:"DRIVER001",

reward:7,

currency:"THB"

});


history.add({

task:"TASK101",

driver:"DRIVER001",

reward:5,

currency:"THB"

});


console.log(

wallet.wallet("DRIVER001")

);

