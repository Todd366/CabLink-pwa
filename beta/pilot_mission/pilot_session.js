

const fs=require("fs");

const file=
"beta/pilot_mission/logs/pilot_sessions.json";


function start(data){

let sessions=[];

if(fs.existsSync(file)){
sessions=JSON.parse(fs.readFileSync(file));
}


let session={

id:"PILOT-RIDE-"+Date.now(),

passenger:data.passenger,

driver:data.driver,

pickup:data.pickup,

destination:data.destination,

events:[],

status:"ACTIVE",

created:new Date().toISOString()

};


sessions.push(session);


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


function event(id,data){

let sessions=JSON.parse(
fs.readFileSync(file)
);


let session=
sessions.find(x=>x.id===id);


if(session){

session.events.push({

...data,

time:new Date().toISOString()

});

}


fs.writeFileSync(
file,
JSON.stringify(sessions,null,2)
);


return session;

}


module.exports={
start,
event
};

