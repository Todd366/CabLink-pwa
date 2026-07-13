/* ============================================================
   CabLink role.js — Customer / Driver role system
   Loads BEFORE fix.js. Sets window.STATE.role from localStorage.
   Provides helpers used by fix.js and index.html.
   ============================================================ */
(function () {
  'use strict';

  // Ensure STATE exists (index.html may not have run yet)
  window.STATE = window.STATE || {};

  // ── ROLE READ / WRITE ─────────────────────────────────────
  var ROLE_KEY = 'userRole';

  function getRole()       { return localStorage.getItem(ROLE_KEY) || 'customer'; }
  function setRole(r)      { localStorage.setItem(ROLE_KEY, r); window.STATE.role = r; }
  function isDriver()      { return getRole() === 'driver'; }
  function isCustomer()    { return getRole() === 'customer'; }

  // Expose globally
  window.CL_ROLE = {
    get: getRole,
    set: setRole,
    isDriver: isDriver,
    isCustomer: isCustomer,
    toggle: function () { setRole(isDriver() ? 'customer' : 'driver'); }
  };

  // Sync into STATE immediately
  window.STATE.role = getRole();

  // ── DRIVER SCREEN GATING ──────────────────────────────────
  // Hides the driver KPI bar on the Driver screen if the user is a customer
  // (not logged in as driver). Does not hide the whole tab — they can still
  // apply via the registration form.
  function applyRoleGating() {
    var driverScreen = document.getElementById('s-driver');
    if (!driverScreen) return;

    var kpiBar = driverScreen.querySelector('.wallet-bar');
    var reqList = document.getElementById('driverRequests');

    if (isCustomer()) {
      if (kpiBar)  kpiBar.style.display   = 'none';
      if (reqList) reqList.style.display  = 'none';
      // Show a friendly prompt instead
      var existing = document.getElementById('cl-driver-cta');
      if (!existing) {
        var cta = document.createElement('div');
        cta.id = 'cl-driver-cta';
        cta.style.cssText = [
          'background:var(--card);border:1px solid var(--border);',
          'border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;'
        ].join('');
        cta.innerHTML = [
          '<div style="font-size:40px;margin-bottom:12px;">🚖</div>',
          '<div style="font-family:var(--font-head);font-size:15px;font-weight:700;',
          'margin-bottom:8px;color:var(--text);">Want to earn as a driver?</div>',
          '<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">',
          'Register to receive ride requests and earn 1 THB per trip.</div>',
          '<button class="btn btn-primary" onclick="window.showDriverRegistrationForm()">',
          '🚗 Apply to Drive</button>'
        ].join('');
        driverScreen.insertBefore(cta, driverScreen.querySelector('#driverRequests'));
      }
    } else {
      // Driver mode — show everything normally
      if (kpiBar)  kpiBar.style.display  = '';
      if (reqList) reqList.style.display = '';
      var old = document.getElementById('cl-driver-cta');
      if (old) old.remove();
    }
  }

  // ── LOCAL STORAGE MIGRATION ───────────────────────────────
  // Older versions stored isDriver as 'true'/'false' string.
  // Migrate to the new unified ROLE_KEY.
  (function migrate() {
    var legacy = localStorage.getItem('isDriver');
    if (legacy === 'true' && !localStorage.getItem(ROLE_KEY)) {
      setRole('driver');
    }
  })();

  // ── BOOT ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    applyRoleGating();

    // Re-apply gating whenever the Driver tab is opened
    var driverNavBtn = document.getElementById('nav-driver');
    if (driverNavBtn) {
      driverNavBtn.addEventListener('click', function () {
        setTimeout(applyRoleGating, 50); // after showScreen() runs
      });
    }
  });

  // ── ROLE SWITCH EVENT (fired by fix.js badge) ─────────────
  window.addEventListener('cl:roleChanged', function () {
    applyRoleGating();
  });

  console.log('✅ role.js loaded — role:', getRole());
})();
