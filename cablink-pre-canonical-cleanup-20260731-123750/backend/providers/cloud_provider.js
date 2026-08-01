
require("dotenv").config();

function status(){

return {

provider:
process.env.CLOUD_PROVIDER || "NOT_CONFIGURED",

url:
!!process.env.CLOUD_DATABASE_URL,

key:
!!process.env.CLOUD_API_KEY

};

}


module.exports={
status
};

