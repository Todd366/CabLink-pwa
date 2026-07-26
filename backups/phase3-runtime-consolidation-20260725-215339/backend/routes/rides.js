const router=require("express").Router();

const rides=require("../database/ride_repository");

const matching=require("../services/driver_matching_service");

const orchestrator=require("../services/ride_orchestrator_service");



router.post(
"/request",
(req,res)=>{


let ride={

id:"RIDE-"+Date.now(),

...req.body,

status:"REQUESTED",

created:new Date().toISOString()

};



rides.create(ride);


// find available drivers

let drivers=
matching.nearby(
req.body.location ||
{
lat:-24.6282,
lng:25.9231
}
);



let nearest=
drivers[0];



if(nearest){


let assigned=
orchestrator.assignDriver(
ride.id,
nearest
);


ride.status=
"DRIVER_FOUND";

ride.driver=
nearest;


}



res.json({

success:true,

ride,

nearbyDrivers:
drivers.length

});


}

);




router.get(
"/",
(req,res)=>{

const db=require("../storage/database");

let data=db.read();

console.log(
"📦 rides endpoint count:",
data.rides.length
);

res.json({

success:true,

count:data.rides.length,

rides:data.rides

});

}

);


router.patch(
"/:id",
(req,res)=>{

res.json(
rides.update(
req.params.id,
req.body.status
)
);

}

);



module.exports=router;
