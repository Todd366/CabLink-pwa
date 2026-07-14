
function validate(ride){

return {

valid:
Boolean(
ride.passenger &&
ride.driver &&
ride.distance>0
),

checked:new Date().toISOString()

};

}

module.exports={
validate
};
