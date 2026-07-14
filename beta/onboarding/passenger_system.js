

const passengers=[];


function register(data){

let user={

id:"USER-"+Date.now(),

name:data.name,

phone:data.phone,

location:false

};


passengers.push(user);


return user;

}


function locationPermission(id){

let u=passengers.find(x=>x.id===id);

if(u){

u.location=true;

}


return u;

}


module.exports={

register,

locationPermission

};

