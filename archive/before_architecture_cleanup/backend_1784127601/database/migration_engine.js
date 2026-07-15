
function migrate(){

return {

database:"PRODUCTION",

status:"MIGRATION_READY",

time:new Date().toISOString()

};

}


module.exports={
migrate
};
