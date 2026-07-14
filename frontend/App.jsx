import "./styles/cablink.css";
import PassengerDashboard from "./components/passenger_dashboard";


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




<PassengerDashboard/>
</div>

);

}

