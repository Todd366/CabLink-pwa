

const fs=require("fs");

const file="backend/data/users.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function getUser(id){

const db=load();

return db.users.find(
u=>u.id===id
);

}


function createUser(user){

const db=load();

const item={

id:user.id,

name:user.name,

role:user.role,

active:true,

created:new Date().toISOString()

};

db.users.push(item);

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return item;

}


function verifyRole(id,role){

const user=getUser(id);

return !!(
user &&
user.role===role
);

}


module.exports={
getUser,
createUser,
verifyRole
};

