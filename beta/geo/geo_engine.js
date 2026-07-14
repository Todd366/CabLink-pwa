

function distance(lat1,lon1,lat2,lon2){

const R=6371;

const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;

const a=
Math.sin(dLat/2)**2+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)**2;

return Number(
(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))
.toFixed(2)
);

}



function nearbyDrivers(drivers,location,radius){

return drivers.filter(driver=>{

return distance(
location.lat,
location.lng,
driver.lat,
driver.lng
)<=radius;

});

}



function fare(distanceKm,timeMinutes){

let base=10;

let distanceCost=
distanceKm*4;

let timeCost=
timeMinutes*0.5;


return Number(
(base+distanceCost+timeCost)
.toFixed(2)
);

}



module.exports={
distance,
nearbyDrivers,
fare
};

