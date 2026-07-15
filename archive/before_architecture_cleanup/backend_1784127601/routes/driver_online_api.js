
// =========================================
// CABLINK DRIVER ONLINE API
// =========================================

const express=require("express");

const router=express.Router();


// temporary live driver registry bridge
// connected to driver state layer when available

let onlineDrivers=[];


// GET ONLINE DRIVERS

router.get(
"/drivers/online",
(req,res)=>{

res.json(
onlineDrivers
);

});


// DRIVER GO ONLINE

router.post(
"/drivers/online",
(req,res)=>{

let driver=req.body;


if(!driver.id){

driver.id=
"DRV-"+Date.now();

}


driver.status="ONLINE";


onlineDrivers.push(driver);


res.json({

success:true,

driver

});


});


// DRIVER GO OFFLINE

router.post(
"/drivers/offline",
(req,res)=>{


let id=req.body.id;


onlineDrivers=
onlineDrivers.filter(
d=>d.id!==id
);


res.json({

success:true

});


});


module.exports=router;

