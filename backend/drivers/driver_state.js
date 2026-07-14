
const drivers={};

function update(id,data){

drivers[id]={
id,
...data,
updated:new Date().toISOString()
};

return drivers[id];

}


function get(id){

return drivers[id] || null;

}


function all(){

return Object.values(drivers);

}


module.exports={
update,
get,
all
};

