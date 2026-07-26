

const router=require("express").Router();

const intelligence=
require("../services/driver_intelligence_service");


router.post(
"/drivers/rank",
(req,res)=>{

res.json({

success:true,

drivers:
intelligence.rank(
require("../data/drivers.json").drivers,
req.body.distance || 1

)

});

});


router.post(
"/drivers/best",
(req,res)=>{

res.json({

success:true,

driver:
intelligence.best(
req.body.distance || 1
)

});

});


module.exports=router;

