
require("dotenv").config();


function check(){

return {

cloud_database:{
configured:
Boolean(process.env.DATABASE_URL),
status:
process.env.DATABASE_URL
?
"READY"
:
"WAITING"
},


authentication:{
configured:
Boolean(process.env.AUTH_API_KEY),
status:
process.env.AUTH_API_KEY
?
"READY"
:
"WAITING"
},


maps:{
configured:
Boolean(process.env.MAPS_API_KEY),
status:
process.env.MAPS_API_KEY
?
"READY"
:
"WAITING"
},


sms:{
configured:
Boolean(process.env.SMS_API_KEY),
status:
process.env.SMS_API_KEY
?
"READY"
:
"WAITING"
},


notifications:{
configured:
Boolean(process.env.FCM_SERVER_KEY),
status:
process.env.FCM_SERVER_KEY
?
"READY"
:
"WAITING"
}

};

}


module.exports={
check
};

