
const firebase=require("../firebase/firebase_adapter");


function broadcast(event){

return firebase.write(
"ride_events",
event
);

}


module.exports={
broadcast
};

