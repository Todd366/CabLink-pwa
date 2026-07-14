
const store=require("../../database/production/store_engine");


function sync(collection,data){

return {

provider:"FIREBASE_SUPABASE_READY",

collection,

data,

status:"SYNC_QUEUE"

};

}


module.exports={
sync
};

