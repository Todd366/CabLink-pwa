
function checkRide(data){

let flags=[];


if(!data.driver)
flags.push("NO_DRIVER");


if(data.distance<=0)
flags.push("INVALID_DISTANCE");


return {

ride:data.id,

risk:
flags.length
?
"HIGH"
:
"LOW",

flags

};

}


module.exports={
checkRide
};
