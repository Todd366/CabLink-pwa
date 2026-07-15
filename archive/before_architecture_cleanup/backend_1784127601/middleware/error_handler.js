
module.exports=function(err,req,res,next){

res.status(500).json({

error:true,

message:err.message

});

};

