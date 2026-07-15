
function status(data){

return {

system:"CabLink User Status",

user:data.user || "Guest",

role:data.role || "Unknown",

connection:data.connection || "OFFLINE",

time:new Date().toISOString()

};

}

module.exports={
status
};

