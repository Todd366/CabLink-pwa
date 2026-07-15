
const locations={};


function update(driver,data){

locations[driver]={

driver,

latitude:data.latitude,

longitude:data.longitude,

speed:data.speed || 0,

time:new Date().toISOString()

};


return locations[driver];

}


function get(driver){

return locations[driver] || null;

}


module.exports={
update,
get
};

