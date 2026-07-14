
const devices=[];


function register(data){

let device={

user:data.user,

device:data.device,

platform:data.platform,

time:new Date().toISOString()

};

devices.push(device);

return device;

}


function list(){

return devices;

}


module.exports={
register,
list
};
