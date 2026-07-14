
const fs=require("fs");

const file=
"database/production/cablink_store.json";


function load(){

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({},null,2)
);

}

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function save(collection,data){

let db=load();


if(!db[collection])
db[collection]=[];


db[collection].push(data);


fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);


return data;

}


function get(collection){

let db=load();

return db[collection] || [];

}


module.exports={
save,
get
};
