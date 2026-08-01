
const rooms={};


function join(user,room){

if(!rooms[room]){
rooms[room]=[];
}

rooms[room].push(user);


return {

user,

room,

status:"JOINED"

};

}


function broadcast(room,event){

return {

room,

event,

receivers:
rooms[room] || [],

time:new Date().toISOString()

};

}


function users(room){

return rooms[room] || [];

}


module.exports={
join,
broadcast,
users
};

