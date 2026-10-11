

const router=require("express").Router();
const sec=require("../middleware/security");

const ledger=require("../services/economy_ledger_service");


router.get(
"/driver/:id/economy",
sec.selfOrAdmin("id"),
async (req,res)=>{

res.json(
await ledger.driverEconomy(
req.params.id
)
);

});


module.exports=router;

