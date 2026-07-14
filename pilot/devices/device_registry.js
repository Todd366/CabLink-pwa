
const devices=[];


function register(data){

let device={

id:"DEVICE-"+Date.now(),

user:data.user,

role:data.role,

platform:data.platform,

status:"REGISTERED",

created:new Date().toISOString()

};


devices.push(device);

return device;

}


function all(){

return devices;

}


module.exports={
register,
all
};

