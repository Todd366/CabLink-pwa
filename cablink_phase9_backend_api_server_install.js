const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 9
REAL BACKEND API SERVER
=========================================
`);

[
"backend/server",
"backend/routes",
"backend/middleware"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// SERVER CORE

fs.writeFileSync(
"backend/server/app.js",
`
const express=require("express");

const app=express();

app.use(express.json());


const rideRoutes=require("../routes/rides");
const userRoutes=require("../routes/users");


app.get(
"/health",
(req,res)=>{

res.json({

system:"CabLink API",

status:"ONLINE",

time:new Date().toISOString()

});

}

);


app.use("/api/rides",rideRoutes);

app.use("/api/users",userRoutes);


module.exports=app;

`
);


// SERVER START

fs.writeFileSync(
"backend/server/index.js",
`
const app=require("./app");


const PORT=
process.env.PORT || 3000;


app.listen(
PORT,
()=>{

console.log({

system:"CabLink Backend",

port:PORT,

status:"RUNNING"

});

}

);

`
);


// RIDE ROUTES

fs.writeFileSync(
"backend/routes/rides.js",
`
const router=require("express").Router();

const ride=require("../rides/ride_lifecycle");


router.post(
"/request",
(req,res)=>{

let result=
ride.create(req.body);


res.json(result);

}

);


router.get(
"/",
(req,res)=>{

res.json(
ride.all()
);

}

);


module.exports=router;

`
);


// USER ROUTES

fs.writeFileSync(
"backend/routes/users.js",
`
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

`
);


// BASIC ERROR HANDLER

fs.writeFileSync(
"backend/middleware/error_handler.js",
`
module.exports=function(err,req,res,next){

res.status(500).json({

error:true,

message:err.message

});

};

`
);


// TEST GUIDE

fs.writeFileSync(
"deployment/API_TEST_GUIDE.md",
`
# CabLink API Test

Start:

node backend/server/index.js


Health:

GET /health


Register User:

POST /api/users/register


Request Ride:

POST /api/rides/request


View Rides:

GET /api/rides

`
);


console.log(`
=========================================

✅ PHASE 9 CREATED

Added:

✅ Express backend server
✅ API routing
✅ Ride endpoints
✅ User endpoints
✅ Health monitoring endpoint
✅ API test guide

START:

node backend/server/index.js

=========================================
`);

