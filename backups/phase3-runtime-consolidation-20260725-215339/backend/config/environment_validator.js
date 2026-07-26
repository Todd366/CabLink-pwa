
require("dotenv").config();

function validate(){

let checks={

firebase:
!!process.env.FIREBASE_PROJECT_ID &&
!!process.env.FIREBASE_API_KEY,

maps:
!!process.env.MAPS_API_KEY,

notifications:
!!process.env.FCM_SERVER_KEY,

database:
!!process.env.DATABASE_URL,

wallet:
!!process.env.PRIVATE_KEY &&
!!process.env.CONTRACT_ADDRESS

};


return {

checks,

ready:
Object.values(checks)
.every(Boolean),

time:new Date().toISOString()

};

}


module.exports={
validate
};

