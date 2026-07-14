const users=[];

function register(data){

let user={

id:
"USER-" +
Date.now() +
"-" +
Math.floor(Math.random()*100000),

role:data.role,

name:data.name

};

users.push(user);

return user;

}


function login(id){

return users.find(x=>x.id===id)||null;

}


module.exports={
register,
login
};
