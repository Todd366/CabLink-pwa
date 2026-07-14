
const alerts=[];

function trigger(data){

let alert={
id:"SOS-"+Date.now(),
ride:data.ride,
user:data.user,
location:data.location,
status:"ACTIVE",
time:new Date().toISOString()
};

alerts.push(alert);

return alert;

}

function history(){
return alerts;
}

module.exports={
trigger,
history
};
