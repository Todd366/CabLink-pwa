
const events=
require("./ride_event_service");


function notify(data){

return events.add({

user:data.user,

driver:data.driver,

ride:data.ride,

type:data.type,

message:data.message

});

}


module.exports={
notify
};

