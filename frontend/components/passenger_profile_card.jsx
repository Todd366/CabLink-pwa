
export default function PassengerProfileCard({profile}){

return (

<div>

<h2>🧍 Passenger Profile</h2>

<p>
Rides: {profile.rides}
</p>

<p>
Spent: P{profile.spent}
</p>

<p>
THB Earned: {profile.thbEarned}
</p>

<p>
Rating: ⭐ {profile.rating}
</p>

</div>

);

}
