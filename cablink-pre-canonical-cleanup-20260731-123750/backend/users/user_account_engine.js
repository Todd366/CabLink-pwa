
const store=require("../../database/production/store_engine");


function createUser(data){

let user={

id:"ACCOUNT-"+Date.now(),

name:data.name,

phone:data.phone,

role:data.role,

verified:false,

created:new Date().toISOString()

};


store.save(
"users",
user
);


return user;

}


function getUser(id){

return store
.get("users")
.find(x=>x.id===id);

}


module.exports={
createUser,
getUser
};

