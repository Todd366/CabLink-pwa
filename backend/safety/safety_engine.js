
const incidents=[];


function create(data){

let incident={

id:"SAFE-"+Date.now(),

ride:data.ride,

type:data.type,

description:data.description,

time:new Date().toISOString()

};

incidents.push(incident);

return incident;

}


function all(){

return incidents;

}


module.exports={
create,
all
};
