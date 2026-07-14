

const router=require("express").Router();

const matching=
require("../services/driver_matching_service");


// driver online update

router.post(
"/driver/location",
(req,res)=>{

res.json({

success:true,

driver:
matching.updateDriver(
req.body
)

});

});


// find drivers

router.post(
"/matching/drivers",
(req,res)=>{

res.json({

drivers:
matching.nearby(
req.body.location
)

});

});


module.exports=router;

