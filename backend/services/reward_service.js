

module.exports={

create:function(userId,rideId){

return {

id:"REWARD-"+Date.now(),

userId:userId,

rideId:rideId,

token:"THB",

amount:1,

createdAt:new Date().toISOString()

};

}

};

