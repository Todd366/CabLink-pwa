
const history=[];

function send(data){

let notification={
id:"NOTIFY-"+Date.now(),
type:data.type,
user:data.user,
message:data.message,
status:"CREATED",
time:new Date().toISOString()
};

history.push(notification);

return notification;

}


function all(){
return history;
}


module.exports={
send,
all
};
