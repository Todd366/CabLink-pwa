import React,{useEffect,useState} from "react";

import CabLinkHeader from "./components/CabLinkHeader.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx";

import PassengerDashboard from "./components/passenger_dashboard.jsx";
import PassengerRide from "./pages/PassengerRide.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import UpdatesCenter from "./pages/UpdatesCenter.jsx";


export default function App(){

const [role,setRole]=useState("passenger");
const [screen,setScreen]=useState("home");
const [apiStatus,setApiStatus]=useState("CHECKING");


useEffect(()=>{

fetch("/api/health")
.then(r=>r.json())
.then(data=>{

if(data.status==="ONLINE"){
setApiStatus("ONLINE");
}else{
setApiStatus("UNKNOWN");
}

})
.catch(()=>setApiStatus("OFFLINE"));

},[]);



function renderScreen(){

if(role==="driver"){
return <DriverDashboard />;
}


if(screen==="rides"){
return <PassengerRide />;
}


if(screen==="profile"){
return <UpdatesCenter />;
}


return <PassengerDashboard />;

}



return (

<div className="app-shell">

<CabLinkHeader
role={role}
setRole={setRole}
/>


<div className="content">

{renderScreen()}

</div>


<div
style={{
position:"fixed",
right:"15px",
bottom:"80px",
padding:"8px 12px",
borderRadius:"20px",
background:
apiStatus==="ONLINE"
?"green"
:
apiStatus==="OFFLINE"
?"red"
:"orange",
color:"white",
fontSize:"12px"
}}
>
API: {apiStatus}
</div>


<BottomNavigation
screen={screen}
setScreen={setScreen}
/>


</div>

);

}
