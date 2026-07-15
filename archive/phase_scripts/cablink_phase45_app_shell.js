const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 45
APP SHELL + ROLE NAVIGATION SYSTEM
PASSENGER / DRIVER EXPERIENCE
=========================================
`);

[
"frontend/components",
"frontend/pages",
"frontend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// APP SHELL

fs.writeFileSync(
"frontend/App.jsx",
`

import React,{useState} from "react";

import DriverDashboard from "./pages/DriverDashboard";
import PassengerRide from "./pages/PassengerRide";
import UpdatesCenter from "./pages/UpdatesCenter";


export default function App(){

const [role,setRole]=useState("passenger");


return (

<div>


<header>

<h1>
🚕 CabLink
</h1>

<button
onClick={()=>
setRole(
role==="passenger"
?"driver"
:"passenger"
)
}
>

Switch to {role==="passenger"?"Driver":"Passenger"}

</button>

</header>



{

role==="driver"

?

<DriverDashboard/>

:

<PassengerRide/>

}



<UpdatesCenter/>



<nav>

<button>
Home
</button>


<button>
Rides
</button>


<button>
Wallet
</button>


<button>
Profile
</button>


</nav>



</div>

);

}

`
);


// STATUS CARD

fs.writeFileSync(
"frontend/components/status_card.jsx",
`

export default function StatusCard({title,value}){

return (

<div>

<h3>{title}</h3>

<p>{value}</p>

</div>

);

}

`
);


// ROLE CONFIG

fs.writeFileSync(
"frontend/services/role_service.js",
`

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

`
);


// TEST

fs.writeFileSync(
"frontend/testing/phase45_shell_test.js",
`

const fs=require("fs");


console.log({

app:
fs.existsSync(
"frontend/App.jsx"
),

status:
fs.existsSync(
"frontend/components/status_card.jsx"
),

roles:
fs.existsSync(
"frontend/services/role_service.js"
)

});

`
);


console.log(`
=========================================

✅ PHASE 45 CREATED

Added:

✅ App shell
✅ Driver/passenger switching
✅ Navigation foundation
✅ Status components
✅ Role service

RUN:

node frontend/testing/phase45_shell_test.js

=========================================
`);

