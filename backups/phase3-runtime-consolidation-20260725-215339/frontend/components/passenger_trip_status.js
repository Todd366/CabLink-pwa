

function render(request){

return {

screen:"Trip Status",

rideId:request.id,

status:request.status,

driver:
request.driver || "Searching"

};

}


module.exports={
render
};

