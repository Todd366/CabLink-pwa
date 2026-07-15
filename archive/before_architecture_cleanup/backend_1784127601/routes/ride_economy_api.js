

const router=require("express").Router();

const economy=require("../services/ride_economy_service");


router.post(
"/economy/ride/accept",
(req,res)=>{

res.json({

success:true,

ride:
economy.accept(
req.body.driver,
req.body.ride || {}
)

});

});


router.post(
"/economy/ride/complete",
(req,res)=>{

res.json({

success:true,

result:
economy.complete(
req.body.id
)

});

});


router.get(
"/economy/rides",
(req,res)=>{

res.json({

success:true,

rides:economy.list()

});

});


module.exports=router;

