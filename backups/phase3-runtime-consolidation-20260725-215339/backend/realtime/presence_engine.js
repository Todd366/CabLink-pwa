
const users={};


function connect(data){

users[data.user]={

device:data.device,

role:data.role,

online:true,

lastSeen:new Date().toISOString()

};


return users[data.user];

}


function disconnect(user){

if(users[user])
users[user].online=false;

}


function online(){

return Object.values(users);

}


module.exports={
connect,
disconnect,
online
};

