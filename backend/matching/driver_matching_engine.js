
function findDriver(drivers,location){

let available=
drivers.filter(
d=>d.online===true
);


return available.length
?
available[0]
:
null;

}


module.exports={
findDriver
};
