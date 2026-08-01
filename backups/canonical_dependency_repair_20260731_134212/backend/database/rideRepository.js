

const fs=require("fs");

const file="backend/database/rides.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(fs.readFileSync(file));

}


function save(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


module.exports={

all(){

return load();

},


create(ride){

let rides=load();

rides.push(ride);

save(rides);

return ride;

},


update(id,data){

let rides=load();

let ride=rides.find(r=>r.id===id);

if(!ride) return null;


Object.assign(
ride,
data,
{
updatedAt:new Date().toISOString()
}
);

save(rides);

return ride;

}

};

