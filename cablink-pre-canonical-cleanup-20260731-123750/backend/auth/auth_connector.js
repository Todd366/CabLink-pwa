
require("dotenv").config();

function status(){

return {

provider:
process.env.AUTH_PROVIDER || "NONE",

configured:
Boolean(process.env.AUTH_API_KEY),

timestamp:new Date().toISOString()

};

}


function createSession(user){

return {

session:"SESSION-"+Date.now(),

user,

status:"AUTH_SESSION_CREATED"

};

}


module.exports={
status,
createSession
};
