
const stream={};


function publish(driver,location){

stream[driver]={

driver,

location,

time:new Date().toISOString()

};


return stream[driver];

}


function read(driver){

return stream[driver];

}


module.exports={
publish,
read
};

