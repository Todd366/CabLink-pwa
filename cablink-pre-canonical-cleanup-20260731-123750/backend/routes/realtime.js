
const router=require("express").Router();

const driver=require("../drivers/driver_state");
const gps=require("../tracking/location_tracker");
const events=require("../realtime/event_bus");


router.post(
"/driver/status",
(req,res)=>{

res.json(
driver.update(
req.body.id,
req.body
)
);

}

);


router.post(
"/driver/location",
(req,res)=>{

res.json(
gps.update(
req.body.driver,
req.body.location
)
);

}

);


router.post(
"/event",
(req,res)=>{

res.json(
events.publish(
req.body.type,
req.body.data
)
);

}

);


router.get(
"/events",
(req,res)=>{

res.json(
events.history()
);

}

);


module.exports=router;

