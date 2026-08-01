const store=require("./ride_store");


module.exports=function(app){


app.post("/api/rides",(req,res)=>{

    try{

        const ride=store.createRide(req.body);

        console.log(
        "🚕 NEW RIDE:",
        ride.id
        );

        res.json({
            success:true,
            ride
        });

    }catch(e){

        res.status(500)
        .json({
            error:e.message
        });

    }

});



app.get("/api/rides",(req,res)=>{

    res.json(
        store.getRides()
    );

});



app.get("/api/rides/:id",(req,res)=>{

    const ride=
    store.getRide(req.params.id);


    if(!ride)
        return res.status(404)
        .json({
            error:"Ride not found"
        });


    res.json(ride);

});



app.patch("/api/rides/:id",(req,res)=>{

    const ride=
    store.updateRide(
        req.params.id,
        req.body
    );


    if(!ride)
        return res.status(404)
        .json({
            error:"Ride not found"
        });


    res.json(ride);

});


};
