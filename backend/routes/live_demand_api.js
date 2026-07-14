

const router=require("express").Router();

const demand=
require("../services/live_demand_service");


// simulate incoming passenger

router.post(
"/demand/request",
(req,res)=>{

res.json({

success:true,

data:
demand.addRequest(
req.body.location
)

});

});


// complete ride

router.post(
"/demand/complete",
(req,res)=>{

res.json({

success:true,

data:
demand.completeRequest(
req.body.location
)

});

});


// driver hotspots

router.get(
"/driver/hotspots",
(req,res)=>{

res.json({

hotspots:
demand.hotspots()

});

});


module.exports=router;

