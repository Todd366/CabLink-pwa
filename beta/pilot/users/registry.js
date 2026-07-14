

const fs=require("fs");

const file="beta/pilot/users/users.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(fs.readFileSync(file));

}


function add(user){

let users=load();

user.id="PILOT-"+Date.now();

user.created=new Date().toISOString();

users.push(user);

fs.writeFileSync(
file,
JSON.stringify(users,null,2)
);

return user;

}


module.exports={
add,
load
};

