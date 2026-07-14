
const logs=[];


function write(type,data){

let entry={

id:"LOG-"+Date.now(),

type,

data,

time:new Date().toISOString()

};

logs.push(entry);

return entry;

}


function all(){

return logs;

}


module.exports={
write,
all
};

