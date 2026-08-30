
const router=require("express").Router();

const users=require("../database/user_repository");


router.post(
"/register",
(req,res)=>{

let user={

id:"USER-"+Date.now(),

...req.body,

created:new Date().toISOString()

};


res.json(
users.create(user)
);

}

);


router.get(
"/",
(req,res)=>{

res.json(
users.all()
);

}

);


module.exports=router;

