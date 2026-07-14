

const fs=require("fs");

const file="database/production/database.json";


function load(){

return JSON.parse(
fs.readFileSync(file)
);

}


function save(type,data){

let db=load();

if(!db[type]) db[type]=[];

db[type].push(data);

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return data;

}


module.exports={save,load};

