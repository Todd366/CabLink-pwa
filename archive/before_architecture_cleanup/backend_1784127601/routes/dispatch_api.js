

const router=require("express").Router();

const dispatch=
require("../services/dispatch_service");


// passenger creates ride

router.post(
"/dispatch/request",
(req,res)=>{

res.json({

success:true,

request:
dispatch.createRequest(
req.body
)

});

});


// attach drivers

router.post(
"/dispatch/match",
(req,res)=>{

res.json({

success:true,

request:
dispatch.dispatch(
req.body.id,
req.body.drivers
)

});

});


// driver accepts

router.post(
"/dispatch/accept",
(req,res)=>{

res.json({

success:true,

request:
dispatch.accept(
req.body.id,
req.body.driver
)

});

});


// history

router.get(
"/dispatch/list",
(req,res)=>{

res.json(
dispatch.list()
);

});


module.exports=router;

