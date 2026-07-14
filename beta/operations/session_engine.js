

const fs=require("fs");


const file=
"beta/operations/logs/sessions.json";


function start(){

let sessions=[];


if(fs.existsSync(file)){
sessions=JSON.parse(
fs.readFileSync(file)
);
}


let session={

id:"SESSION-"+Date.now(),

start:new Date().toISOString(),

status:"ACTIVE",

rides:0,

errors:0

};


sessions.push(session);


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


module.exports={
start
};

