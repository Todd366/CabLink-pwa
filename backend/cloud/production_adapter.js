
function connect(){

return {

provider:
process.env.CLOUD_PROVIDER || "NOT_CONFIGURED",

database:
!!process.env.CLOUD_DATABASE_URL,

status:
"READY_FOR_CONNECTION"

};

}


module.exports={
connect
};
