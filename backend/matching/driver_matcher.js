
function find(drivers,ride){

return drivers
.filter(
d=>d.online===true
)
.map(
d=>({

driver:d,

distance:
Math.abs(
d.latitude-ride.latitude
)+
Math.abs(
d.longitude-ride.longitude
)

})
)
.sort(
(a,b)=>
a.distance-b.distance
)[0];

}


module.exports={
find
};

