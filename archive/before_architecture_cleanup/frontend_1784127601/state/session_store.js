

let session={

user:null,

role:null,

ride:null

};


function setUser(user){

session.user=user;

session.role=user.role;

}


function setRide(ride){

session.ride=ride;

}


function get(){

return session;

}


module.exports={
setUser,
setRide,
get
};

