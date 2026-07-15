const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DRIVER ONLINE ROUTE BRIDGE
=========================================
`);

let file="backend/routes/driver_online_api.js";


if(fs.existsSync(file)){

console.log("✅ Route already exists");
process.exit(0);

}


let code=`
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

`;

fs.writeFileSync(file,code);


console.log(
"✅ Driver online route created"
);

console.log(file);

console.log(`
NEXT:
Mount this route in backend/server.js
`);

