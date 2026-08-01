
function provider(){

return {

provider:
process.env.MAPS_PROVIDER || "OPENSTREETMAP",

status:"READY"

};

}


function route(start,end){

return {

start,

end,

distance:"CALCULATING",

status:"ROUTE_REQUESTED"

};

}


module.exports={
provider,
route
};

