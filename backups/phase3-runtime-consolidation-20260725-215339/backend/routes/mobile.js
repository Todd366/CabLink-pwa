
const router=require("express").Router();

const devices=require("../mobile/device_registry");
const trips=require("../trips/trip_manager");


router.post(
"/register",
(req,res)=>{

res.json(
devices.register(req.body)
);

}

);


router.post(
"/heartbeat/:id",
(req,res)=>{

res.json(
devices.heartbeat(req.params.id)
);

}

);


router.post(
"/trip/start",
(req,res)=>{

res.json(
trips.start(req.body)
);

}

);


module.exports=router;

