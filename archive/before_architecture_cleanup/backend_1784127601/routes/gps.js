
const router=require("express").Router();

const gps=require("../gps/gps_service");


router.post(
"/update",
(req,res)=>{

res.json(
gps.update(
req.body.device,
req.body.location
)
);

}

);


router.get(
"/:device",
(req,res)=>{

res.json(
gps.get(req.params.device)
);

}

);


module.exports=router;

