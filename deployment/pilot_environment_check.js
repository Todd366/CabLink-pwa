
const cloud=require("../backend/providers/cloud_provider");
const session=require("../backend/sessions/session_engine");


console.log({

system:"CabLink Pilot Environment",

cloud:cloud.status(),

sessions:
session.active(),

time:new Date().toISOString()

});


