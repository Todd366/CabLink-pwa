
const router=require("express").Router();

const completion=
require("../services/ride_completion_service");


router.post(
"/ride/complete",
(req,res)=>{

res.json({

success:true,

result:
completion.completeRide(
req.body
)

});

});


module.exports=router;

