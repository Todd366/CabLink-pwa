
function render(data){

return {

component:"CabLink Live Map",

driverMarker:data.driver || null,

passengerMarker:data.passenger || null,

route:data.route || null,

updated:new Date().toISOString()

};

}


module.exports={
render
};

