
const router=require("express").Router();

const rides=require("../database/ride_repository");


router.post(
"/request",
(req,res)=>{

let ride={

id:"RIDE-"+Date.now(),

...req.body,

status:"REQUESTED",

created:new Date().toISOString()

};


res.json(
rides.create(ride)
);

}

);


router.get(
"/",
(req,res)=>{

res.json(
rides.all()
);

}

);


router.patch(
"/:id",
(req,res)=>{

res.json(
rides.update(
req.params.id,
req.body.status
)
);

}

);


module.exports=router;

