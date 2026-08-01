
const locations={};


function update(driver,data){

locations[driver]={

driver,

latitude:data.latitude,

longitude:data.longitude,

accuracy:data.accuracy || null,

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

