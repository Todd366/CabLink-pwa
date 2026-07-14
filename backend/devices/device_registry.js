
const devices={};


function register(data){

devices[data.user]={

user:data.user,

device:data.device,

token:data.token,

platform:data.platform,

created:new Date().toISOString()

};


return devices[data.user];

}


function all(){

return Object.values(devices);

}


module.exports={
register,
all
};

