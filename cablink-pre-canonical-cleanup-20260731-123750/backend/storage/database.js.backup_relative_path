
const fs=require("fs");

const file="backend/storage/cablink_db.json";


if(!fs.existsSync(file)){

fs.mkdirSync(
"backend/storage",
{recursive:true}
);

fs.writeFileSync(
file,
JSON.stringify({
users:[],
rides:[]
},null,2)
);

}


function read(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function write(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


module.exports={
read,
write
};

