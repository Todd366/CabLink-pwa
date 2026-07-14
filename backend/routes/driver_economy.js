

const router=require("express").Router();

const wallet=require("../rewards/wallet_service");
const history=require("../rewards/reward_history");


router.get(
"/driver/:id/economy",
(req,res)=>{


res.json({

driver:req.params.id,

wallet:
wallet.wallet(req.params.id),

rewards:
history.getDriver(req.params.id)

});


}

);


module.exports=router;

