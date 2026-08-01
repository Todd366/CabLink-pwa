

const router=require("express").Router();

const demand=require("../services/demand_service");


router.get(
"/driver/demand",
(req,res)=>{

res.json(
demand.getDemand()
);

});


module.exports=router;

