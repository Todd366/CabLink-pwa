

const router=require("express").Router();

const ledger=require("../services/economy_ledger_service");


router.get(
"/driver/:id/economy",
(req,res)=>{

res.json(
ledger.driverEconomy(
req.params.id
)
);

});


module.exports=router;

