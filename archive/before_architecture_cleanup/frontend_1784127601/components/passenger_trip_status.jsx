import React from "react";

export default function PassengerTripStatus({
    rideId,
    status,
    driver
}){

return (

<div className="cab-card">

<h2>
🚕 Trip Status
</h2>

<p>
Ride ID: {rideId || "None"}
</p>

<p>
Status: {status || "Searching"}
</p>

<p>
Driver:
{driver || "Searching"}
</p>

</div>

);

}
