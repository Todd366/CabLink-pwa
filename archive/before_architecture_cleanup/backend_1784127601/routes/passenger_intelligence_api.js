
const router=require("express").Router();

const passenger=
require("../services/passenger_intelligence_service");


router.get(
"/passenger/:id/profile",
(req,res)=>{

res.json({
success:true,
profile:
passenger.profile(req.params.id)
});

});


router.post(
"/passenger/update",
(req,res)=>{

res.json({
success:true,
profile:
passenger.updateRide(
req.body.id,
req.body.fare,
req.body.thb
)
});

});


module.exports=router;
