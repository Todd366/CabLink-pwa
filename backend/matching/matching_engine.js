

function findDriver(drivers,passenger){

return drivers
.filter(d=>d.online)
.sort((a,b)=>
a.distance-b.distance
)[0] || null;

}


module.exports={
findDriver
};

