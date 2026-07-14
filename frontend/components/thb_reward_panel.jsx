import React from "react";

export default function THBRewardPanel({
    reward=0,
    currency="THB",
    status="Pending"
}){

return (

<div className="cab-card">

<h2>
🪙 THoBoCoin Rewards
</h2>

<p>
Reward: {reward} {currency}
</p>

<p>
Status: {status}
</p>

</div>

);

}
