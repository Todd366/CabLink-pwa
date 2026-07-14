
const router=require("express").Router();

const state=require("../services/ride_state_service");


router.post("/ride/create",(req,res)=>{

res.json({
success:true,
ride:state.create(req.body)
});

});


router.post("/ride/status",(req,res)=>{

res.json({
success:true,
ride:state.update(
req.body.id,
req.body.status
)
});

});


router.get("/ride/:id/status",(req,res)=>{

res.json({
ride:state.get(req.params.id)
});

});


module.exports=router;
