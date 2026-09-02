

const router=require("express").Router();

const ledger=require("../services/economy_ledger_service");


router.get(
"/driver/:id/economy",
async (req,res)=>{

res.json(
await ledger.driverEconomy(
req.params.id
)
);

});


module.exports=router;

