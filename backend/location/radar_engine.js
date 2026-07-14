
function findNearbyDrivers(drivers,location,radius){

return drivers.filter(driver=>
driver.online &&
driver.distance<=radius
);

}


module.exports={
findNearbyDrivers
};
