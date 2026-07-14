
const router=require("express").Router();

const notification=
require("../services/notification_service");

const events=
require("../services/ride_event_service");


router.post(
"/notifications/create",
(req,res)=>{

res.json({

success:true,

notification:
notification.notify(req.body)

});

});


router.get(
"/ride/:id/timeline",
(req,res)=>{

res.json({

events:
events.history(
req.params.id
)

});

});


module.exports=router;

