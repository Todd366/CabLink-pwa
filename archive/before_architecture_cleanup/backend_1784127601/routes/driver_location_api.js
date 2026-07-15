
const router=require("express").Router();

const location=
require("../services/driver_location_service");


router.post(
"/driver/location/update",
(req,res)=>{

res.json({
success:true,
location:
location.update(req.body)
});

});


router.post(
"/ride/tracking",
(req,res)=>{

res.json({
success:true,
tracking:
location.calculate(
req.body.driver,
req.body.pickup
)
});

});


module.exports=router;

