
const router=require("express").Router();


const users=[];


router.post(
"/register",
(req,res)=>{

let user={

id:"USER-"+Date.now(),

...req.body,

created:new Date().toISOString()

};


users.push(user);


res.json(user);

}

);


router.get(
"/",
(req,res)=>{

res.json(users);

}

);


module.exports=router;

