
const devices={};


function register(data){

devices[data.device]={

device:data.device,

user:data.user,

role:data.role,

platform:data.platform,

status:"CONNECTED",

lastSeen:new Date().toISOString()

};


return devices[data.device];

}


function heartbeat(device){

if(devices[device]){

devices[device].lastSeen=
new Date().toISOString();

devices[device].status="ACTIVE";

}

return devices[device];

}


function all(){

return Object.values(devices);

}


module.exports={
register,
heartbeat,
all
};

