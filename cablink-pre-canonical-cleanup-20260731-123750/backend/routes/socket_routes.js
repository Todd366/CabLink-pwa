
const router=require("express").Router();

const channel=require("../realtime/ride_channel");


router.post(
"/join",
(req,res)=>{

res.json(
channel.passengerJoin(
req.body.ride,
req.body.user
)
);

}

);


router.post(
"/update",
(req,res)=>{

res.json(
channel.sendUpdate(
req.body.ride,
req.body.event
)
);

}

);


module.exports=router;

