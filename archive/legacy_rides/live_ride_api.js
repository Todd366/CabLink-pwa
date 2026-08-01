

const router=require("express").Router();

const rides=
require("../services/live_ride_service");


// create passenger ride

router.post(
"/ride/create",
(req,res)=>{

res.json({

success:true,

ride:
rides.create(req.body)

});

});


// update state

router.post(
"/ride/status",
(req,res)=>{

res.json({

success:true,

ride:
rides.update(
req.body.id,
req.body.status
)

});

});


// driver accepts

router.post(
"/ride/assign",
(req,res)=>{

res.json({

success:true,

ride:
rides.assignDriver(
req.body.id,
req.body.driver
)

});

});


// get live ride

router.get(
"/ride/:id",
(req,res)=>{

res.json(
rides.get(
req.params.id
)
);

});


module.exports=router;

