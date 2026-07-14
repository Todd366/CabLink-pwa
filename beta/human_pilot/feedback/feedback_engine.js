

const fs=require("fs");

const file=
"beta/human_pilot/feedback/feedback.json";


function add(data){

let list=[];

if(fs.existsSync(file)){
list=JSON.parse(fs.readFileSync(file));
}

data.time=new Date().toISOString();

list.push(data);

fs.writeFileSync(
file,
JSON.stringify(list,null,2)
);

return data;

}


function all(){

if(!fs.existsSync(file)){
return [];
}

return JSON.parse(fs.readFileSync(file));

}


module.exports={add,all};

