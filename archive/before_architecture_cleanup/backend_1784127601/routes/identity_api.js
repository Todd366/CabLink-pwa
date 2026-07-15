

const router=require("express").Router();

const identity=
require("../services/identity_service");


// get identity

router.get(
"/user/:id",
(req,res)=>{

res.json({

success:true,

user:
identity.getUser(
req.params.id
)

});

});


// create user

router.post(
"/user/create",
(req,res)=>{

res.json({

success:true,

user:
identity.createUser(
req.body
)

});

});


// role verification

router.post(
"/user/verify-role",
(req,res)=>{

res.json({

success:true,

allowed:
identity.verifyRole(
req.body.id,
req.body.role
)

});

});


module.exports=router;

