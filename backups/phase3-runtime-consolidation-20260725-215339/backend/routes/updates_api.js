

const router=require("express").Router();
const fs=require("fs");


router.get(
"/updates",
(req,res)=>{

res.json(
JSON.parse(
fs.readFileSync(
"backend/data/cablink_updates.json",
"utf8"
)
)
);

});


module.exports=router;

