
require("dotenv").config();


function status(){

return {

provider:"FIREBASE",

configured:
!!process.env.FIREBASE_PROJECT_ID &&
!!process.env.FIREBASE_API_KEY,

project:
process.env.FIREBASE_PROJECT_ID || null

};

}


function write(collection,data){

return {

collection,

data,

status:"FIREBASE_WRITE_READY",

time:new Date().toISOString()

};

}


module.exports={
status,
write
};

