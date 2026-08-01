import React from "react";

export default function BottomNavigation({
  screen,
  setScreen
}) {

return (

<nav className="bottom-nav">

<button onClick={() => setScreen("home")}>
🏠 Home
</button>

<button onClick={() => setScreen("rides")}>
🚕 Rides
</button>

<button onClick={() => setScreen("wallet")}>
🪙 Wallet
</button>

<button onClick={() => setScreen("profile")}>
👤 Profile
</button>

</nav>

);

}
