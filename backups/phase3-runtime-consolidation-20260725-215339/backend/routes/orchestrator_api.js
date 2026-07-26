

const router=require("express").Router();

const engine=
require("../services/ride_orchestrator_service");



router.post(
"/orchestrator/create",
(req,res)=>{

res.json({

success:true,

ride:
engine.createRide(req.body)

});

});



router.post(
"/orchestrator/assign",
(req,res)=>{

res.json({

success:true,

ride:
engine.assignDriver(
req.body.id,
req.body.driver
)

});

});



router.post(
"/orchestrator/arrived",
(req,res)=>{

res.json({

success:true,

ride:
engine.driverArrived(
req.body.id
)

});

});



router.post(
"/orchestrator/start",
(req,res)=>{

res.json({

success:true,

ride:
engine.startTrip(
req.body.id
)

});

});



router.post(
"/orchestrator/finish",
(req,res)=>{

res.json({

success:true,

result:
engine.finishTrip(
req.body.id,
req.body.fare
)

});

});


module.exports=router;

