
require("dotenv").config();


function provider(){

return {

type:
process.env.DATABASE_PROVIDER || "LOCAL",

connected:
!!process.env.DATABASE_URL,

timestamp:new Date().toISOString()

};

}


module.exports={
provider
};

