

const api=require("../api/cablink_api");


async function requestRide(data){

return api.request(
"/api/rides/request",
{
method:"POST",
body:JSON.stringify(data)
}
);

}


async function rides(){

return api.request(
"/api/rides"
);

}


module.exports={
requestRide,
rides
};

