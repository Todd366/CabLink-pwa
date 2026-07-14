
const sessions={};


function create(user){

let session={

id:"SESSION-"+Date.now(),

user,

active:true,

created:new Date().toISOString()

};

sessions[session.id]=session;

return session;

}


function active(){

return Object.values(sessions)
.filter(x=>x.active);

}


module.exports={
create,
active
};

