
function calculateDistance(a,b){

let dx=a.lat-b.lat;
let dy=a.lng-b.lng;

return Math.sqrt(
dx*dx+dy*dy
);

}


function route(from,to){

return {

provider:
process.env.MAPS_PROVIDER || "NOT_CONNECTED",

from,

to,

status:"ROUTE_READY"

};

}


module.exports={
calculateDistance,
route
};
