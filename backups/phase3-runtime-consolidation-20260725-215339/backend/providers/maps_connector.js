
const config=require("../config/provider_config");


function status(){

return {

provider:
config.maps.provider || "NONE",

configured:
!!config.maps.key

};

}


function route(start,end){

return {

from:start,

to:end,

status:"ROUTE_REQUEST_READY"

};

}


module.exports={
status,
route
};

