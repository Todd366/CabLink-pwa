

const roles={

passenger:{

home:"PassengerRide"

},

driver:{

home:"DriverDashboard"

}

};


function getRole(){

return localStorage.getItem("cablink_role")
||
"passenger";

}


function setRole(role){

localStorage.setItem(
"cablink_role",
role
);

}


module.exports={
roles,
getRole,
setRole
};

