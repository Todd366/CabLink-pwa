

const drivers=[];


function register(data){

let driver={

id:"DRIVER-"+Date.now(),

name:data.name,

phone:data.phone,

vehicle:data.vehicle,

type:data.type,

license:data.license,

status:"VERIFICATION_PENDING",

online:false

};


drivers.push(driver);

return driver;

}



function approve(id){

let d=drivers.find(x=>x.id===id);

if(d){

d.status="APPROVED";

}

return d;

}



function online(id){

let d=drivers.find(x=>x.id===id);

if(d){

d.status="AVAILABLE";

d.online=true;

}

return d;

}



function available(){

return drivers.filter(x=>x.online);

}



module.exports={

register,

approve,

online,

available

};

