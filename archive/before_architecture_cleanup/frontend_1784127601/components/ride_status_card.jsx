

export default function RideStatusCard({ride}){


return (

<div>

<h2>
🚕 Ride Status
</h2>

<p>
ID: {ride.id}
</p>

<p>
Status: {ride.status}
</p>

<p>
Driver:
{ride.driver || "Searching"}
</p>

</div>

);

}

