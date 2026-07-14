
const router=require("express").Router();

const ride=require("../rides/ride_lifecycle");


router.post(
"/request",
(req,res)=>{

let result=
ride.create(req.body);


res.json(result);

}

);


router.get(
"/",
(req,res)=>{

res.json(
ride.all()
);

}

);


module.exports=router;

