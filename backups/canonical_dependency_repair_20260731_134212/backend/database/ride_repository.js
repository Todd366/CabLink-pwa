
const db=require("../storage/database");


function create(ride){

let data=db.read();

data.rides.push(ride);

db.write(data);

return ride;

}


function all(){

return db.read().rides;

}


function update(id,status){

let data=db.read();

let ride=
data.rides.find(
r=>r.id===id
);


if(ride){

console.warn("[CABLINK] Legacy status mutation blocked");

db.write(data);

}


return ride;

}


module.exports={
create,
all,
update
};

