
const fs=require("fs");

const file=
"beta/operations/logs/events.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(
fs.readFileSync(file)
);

}



function log(event){

let events=load();


event.id=
"EVENT-"+Date.now();


event.time=
new Date().toISOString();


events.push(event);


fs.writeFileSync(
file,
JSON.stringify(events,null,2)
);


return event;

}



function all(){

return load();

}


module.exports={
log,
all
};

