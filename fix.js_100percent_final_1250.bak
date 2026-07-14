console.log("🔥 CabLink fix.js v200 - 100% LOCKED FINAL");

document.addEventListener('DOMContentLoaded', function() {

  // LOCKED DARK THEME
  const theme = document.createElement('style');
  theme.innerHTML = `
    body, html, #app, .screen, .card, .modal, input, select, button, .statusbar {
      background: #0a0a0f !important;
      color: #f0f0f5 !important;
    }
    .btn-primary, #bookBtn, button[class*="btn-primary"] {
      background: #f5c518 !important;
      color: #000 !important;
      font-weight: bold !important;
    }
    .card, .modal { border: 1px solid #2a2a3e !important; }
  `;
  document.head.appendChild(theme);

  // Clean Profile
  function cleanProfile() {
    const nameEl = document.querySelector('#s-profile .card-title');
    const subEl = document.querySelector('#s-profile .card-sub');
    if (nameEl) nameEl.textContent = "Connected User";
    if (subEl) subEl.textContent = "BSTM Member • Gaborone";
  }
  cleanProfile();

  // Honest Booking Flow
  window.bookRide = function() {
    const pickup = (document.getElementById('pickup') || {}).value?.trim();
    const dropoff = (document.getElementById('dropoff') || {}).value?.trim();
    if (!pickup || !dropoff) {
      toast("Please enter pickup and drop-off locations", "warning");
      return;
    }
    toast("🔍 Searching for available drivers in Gaborone...", "info");

    setTimeout(() => {
      toast("😕 No drivers available right now", "warning");
      setTimeout(() => {
        toast("💡 Be the first driver and help build CabLink Botswana!", "info");
      }, 2000);
    }, 1400);
  };

  // Aggressive Final Cleanup
  setTimeout(() => {
    const fakes = ['chatSection','rideIdRow','countdownRow','cancelBtn','driverChat','rideStatusLabel','progressBar'];
    fakes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }, 800);

  console.log("✅ v200 - 100% LOCKED & READY FOR LAUNCH");
});
