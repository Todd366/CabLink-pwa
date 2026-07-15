
const config=require("../config/provider_config");


function connect(){

if(!config.database.url){

return {

status:"WAITING_CONFIGURATION",

provider:
config.database.provider || "NONE"

};

}


return {

status:"CONNECTED",

provider:
config.database.provider

};

}


module.exports={
connect
};

