
const sessions={};


function update(driver,position){

sessions[driver]={

position,

updated:new Date().toISOString()

};

return sessions[driver];

}


function get(driver){

return sessions[driver];

}


module.exports={
update,
get
};
