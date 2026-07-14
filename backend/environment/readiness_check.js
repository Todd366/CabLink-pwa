
const firebase=require("../firebase/firebase_adapter");
const devices=require("../devices/device_registry");


function check(){

return {

firebase:
firebase.status(),

devices:
devices.all().length,

ready:
firebase.status().configured,

time:new Date().toISOString()

};

}


module.exports={
check
};

