
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

