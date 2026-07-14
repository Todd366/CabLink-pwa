
const db=require("../storage/database");


function create(user){

let data=db.read();

data.users.push(user);

db.write(data);

return user;

}


function all(){

return db.read().users;

}


module.exports={
create,
all
};

