
const tickets=[];

function create(data){

let ticket={
id:"TICKET-"+Date.now(),
user:data.user,
issue:data.issue,
status:"OPEN",
time:new Date().toISOString()
};

tickets.push(ticket);

return ticket;

}

function all(){
return tickets;
}

module.exports={
create,
all
};
