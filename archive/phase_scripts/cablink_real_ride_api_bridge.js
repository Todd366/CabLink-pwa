const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REAL RIDE API BRIDGE
=========================================
`);

let file="backend/routes/ride_api.js";


if(fs.existsSync(file)){
 console.log("✅ ride_api already exists");
 process.exit(0);
}


let code=`

const express=require("express");

const router=express.Router();


let activeRides=[];


// CREATE REAL RIDE

router.post(
"/rides",
(req,res)=>{


let ride={

id:
"CL-"+Math.random()
.toString(36)
.substring(2,8)
.toUpperCase(),

pickup:
req.body.pickup,

dropoff:
req.body.dropoff,

fare:
req.body.fare,

rideType:
req.body.rideType,

status:
"REQUESTED",

created:
Date.now()

};


activeRides.push(ride);


console.log(
"🚕 NEW REAL RIDE",
ride
);


res.json({

success:true,

ride

});


});


// VIEW RIDES

router.get(
"/rides",
(req,res)=>{

res.json(
activeRides
);

});


module.exports=router;

`;


fs.writeFileSync(file,code);


console.log(
"✅ Real ride API created"
);

console.log(file);

console.log(`
NEXT:
Mount in backend/server.js
`);

