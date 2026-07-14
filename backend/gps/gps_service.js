
const positions={};


function update(device,data){

positions[device]={

device,

latitude:data.latitude,

longitude:data.longitude,

accuracy:data.accuracy || null,

speed:data.speed || 0,

timestamp:new Date().toISOString()

};


return positions[device];

}


function get(device){

return positions[device] || null;

}


module.exports={
update,
get
};

