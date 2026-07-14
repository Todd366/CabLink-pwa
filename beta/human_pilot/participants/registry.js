
const fs=require("fs");

const file="beta/human_pilot/participants/participants.json";

function load(){
if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}
return JSON.parse(fs.readFileSync(file));
}


function add(person){

let users=load();

person.id="PILOT-"+Date.now();
person.created=new Date().toISOString();
person.status="REGISTERED";

users.push(person);

fs.writeFileSync(
file,
JSON.stringify(users,null,2)
);

return person;

}


module.exports={add,load};
