console.log("🔥 CabLink fix.js v100 - FINAL STABLE");

document.addEventListener('DOMContentLoaded', function() {

  // FORCE DARK THEME + RESPONSIVE FIX
  const style = document.createElement('style');
  style.innerHTML = `
    body, html, #app, .screen, .card, .modal, input, select, button {
      background: #0a0a0f !important;
      color: #f0f0f5 !important;
    }
    .btn-primary, button[class*="btn-primary"], #bookBtn, .yellow-btn {
      background: #f5c518 !important;
      color: #000 !important;
      font-weight: bold !important;
    }
    .card, .modal { border: 1px solid #2a2a3e !important; }
    .statusbar { background: #0a0a0f !important; }
    @media (max-width: 480px) { .screen { padding: 12px; } }
  `;
  document.head.appendChild(style);

  // CLEAN PROFILE
  function cleanProfile() {
    const nameEl = document.querySelector('#s-profile .card-title');
    const subEl = document.querySelector('#s-profile .card-sub');
    if (nameEl) nameEl.textContent = "Connected User";
    if (subEl) subEl.textContent = "BSTM Member • Gaborone";
  }
  cleanProfile();

  // HIDE FAKE RIDE ELEMENTS
  setTimeout(() => {
    const fakes = ['chatSection','rideIdRow','countdownRow','cancelBtn','driverChat','rideStatusLabel','progressBar'];
    fakes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }, 800);

  console.log("✅ v100 FINAL STABLE - Theme + Responsive + Clean");
});
