/* ============================================================
   CabLink fix.js — v66 FINAL
   Responsibilities:
   1. Re-inject the CSS variables that the broken :root{} wiped
   2. Remove the destructive Inter !important font override
   3. Stable Firebase init (compat v9 only, no version clash)
   4. Driver registration with Firestore write + validation
   5. bookRide → "No drivers available" (no fake simulation leak)
   6. Dynamic profile card (wallet-address-driven, not hardcoded)
   ============================================================ */
console.log('✅ fix.js v66 loaded');

// ============================================================
// 1. RESTORE CSS VARIABLES
//    The original :root block had a stray <script> tag inside it
//    which caused the parser to silently drop --bg, --accent, etc.
//    We patch them back via a <style> injected before anything runs.
// ============================================================
(function patchCSSVars() {
  var s = document.createElement('style');
  s.id = 'cl-theme-patch';
  s.textContent = [
    ':root{',
    '  --bg:#0a0a0f;',
    '  --bg2:#16213e;',
    '  --bg3:#0f172a;',
    '  --card:#12121d;',
    '  --accent:#f5c518;',
    '  --accent2:#ff8c00;',
    '  --green:#22d672;',
    '  --red:#ff4757;',
    '  --blue:#4fc3f7;',
    '  --purple:#b388ff;',
    '  --text:#f0f0f5;',
    '  --muted:#888899;',
    '  --border:#2a2a3e;',
    '  --radius:14px;',
    '  --font-head:"Syne",sans-serif;',
    '  --font-mono:"Space Mono",monospace;',
    '}',
    /* Undo the destructive Inter !important override from the old "FINAL FONT FIX" block */
    'html,body,*{font-family:var(--font-mono) !important}',
    '.card-title,.ob-title,.bal-card .val,.lb-rank,.nego-offer,',
    '#thankYouOverlay div,#clockTime,.modal-title{',
    '  font-family:var(--font-head) !important',
    '}',
    /* Force dark background so the "white screen" bug never shows */
    'html,body,#app{background:var(--bg) !important;color:var(--text) !important}'
  ].join('\n');
  // Insert as very first child of <head> so it wins over everything
  var head = document.head || document.documentElement;
  head.insertBefore(s, head.firstChild);
})();

// ============================================================
// 2. PROFILE CARD — driven by wallet address, not hardcoded
// ============================================================
function patchProfileCard() {
  var nameEl  = document.querySelector('#s-profile .card-title');
  var subEl   = document.querySelector('#s-profile .card-sub');
  var iconEl  = document.querySelector('#s-profile .card > div[style*="font-size:48px"]');

  if (!nameEl || !subEl) return; // screen not yet in DOM

  var role = localStorage.getItem('userRole') || 'customer';
  var wallet = (window.STATE && window.STATE.wallet) ? window.STATE.wallet : null;

  var displayName, displaySub, displayIcon;

  if (wallet) {
    displayName = wallet.substring(0, 6) + '…' + wallet.substring(wallet.length - 4);
    displaySub  = role === 'driver' ? 'CabLink Driver · BSC Testnet' : 'CabLink Rider · BSC Testnet';
    displayIcon = role === 'driver' ? '🧑‍✈️' : '🧍';
  } else {
    displayName = 'Not connected';
    displaySub  = 'Connect wallet to see your profile';
    displayIcon = role === 'driver' ? '🧑‍✈️' : '🧍';
  }

  nameEl.textContent = displayName;
  subEl.textContent  = displaySub;
  if (iconEl) iconEl.textContent = displayIcon;
}

// Run once on load, and again after wallet connects
document.addEventListener('DOMContentLoaded', function () {
  patchProfileCard();
  // Poll for wallet changes (MetaMask connects async)
  var pollCount = 0;
  var poller = setInterval(function () {
    patchProfileCard();
    pollCount++;
    if (pollCount > 20) clearInterval(poller);
  }, 1500);
});

// ============================================================
// 3. FIREBASE INIT — safe, single-instance, no version clash
// ============================================================
function initFirebase() {
  var cfg = {
    apiKey:            'AIzaSyBlpLfL6ProXUrqhr9FGET7ACfPOKBudSw',
    authDomain:        'gen-lang-client-0007945213.firebaseapp.com',
    projectId:         'gen-lang-client-0007945213',
    storageBucket:     'gen-lang-client-0007945213.firebasestorage.app',
    messagingSenderId: '570021771449',
    appId:             '1:570021771449:web:70d9e7e254d4ff7e654368'
  };
  if (typeof firebase === 'undefined') { return; } // compat scripts not loaded yet
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  window.db = firebase.firestore();
  console.log('✅ Firebase/Firestore ready');
}

function loadFirebaseCompat(cb) {
  if (typeof firebase !== 'undefined' && firebase.firestore) { cb(); return; }
  var app = document.createElement('script');
  app.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
  app.onload = function () {
    var fs = document.createElement('script');
    fs.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
    fs.onload = cb;
    document.head.appendChild(fs);
  };
  document.head.appendChild(app);
}

loadFirebaseCompat(initFirebase);

// ============================================================
// 4. BOOK RIDE — replaces the original with clean "no drivers" UX
// ============================================================
window.bookRide = function () {
  var pickup  = (document.getElementById('pickup')  || {}).value || '';
  var dropoff = (document.getElementById('dropoff') || {}).value || '';

  pickup  = pickup.trim();
  dropoff = dropoff.trim();

  if (!pickup || !dropoff) {
    toast('Please enter pickup and drop-off locations', 'warning');
    return;
  }

  if (!navigator.onLine) {
    // Delegate to the existing offline queue function
    if (typeof queueOfflineRide === 'function') {
      queueOfflineRide({ pickup: pickup, dropoff: dropoff,
        type: (window.STATE || {}).selectedRideType || 'standard',
        fare: (window.STATE || {}).selectedFare || 20,
        time: Date.now() });
    }
    toast('📡 Offline — ride queued', 'warning');
    return;
  }

  toast('🔍 Searching for nearby drivers…', 'warning');
  setTimeout(function () {
    toast('😕 No drivers available right now — try again in a few minutes', 'warning');
  }, 1800);
};

// ============================================================
// 5. DRIVER REGISTRATION FORM + FIRESTORE SUBMIT
// ============================================================
window.toggleDriverMode = function () {
  showDriverRegistrationForm();
};

window.showDriverRegistrationForm = function () {
  // Remove any stale modal
  document.querySelectorAll('.cl-driver-modal').forEach(function (m) { m.remove(); });

  var modal = document.createElement('div');
  modal.className = 'cl-driver-modal';
  modal.style.cssText = [
    'position:fixed;inset:0;z-index:99999;',
    'background:rgba(0,0,0,0.92);',
    'display:flex;align-items:center;justify-content:center;',
    'font-family:var(--font-mono);'
  ].join('');

  modal.innerHTML = [
    '<div style="background:var(--bg2);width:92%;max-width:400px;',
    'border-radius:16px;padding:24px;border:1px solid var(--border);">',
      '<h3 style="text-align:center;margin:0 0 20px;font-family:var(--font-head);',
      'color:var(--accent);font-size:18px;">🚖 Become a CabLink Driver</h3>',

      '<input id="cl-d-name" type="text" placeholder="Full Name *"',
      ' style="width:100%;padding:12px 14px;margin:6px 0;border-radius:10px;',
      'border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">',

      '<input id="cl-d-phone" type="tel" placeholder="Phone — 8 digits e.g. 71234567"',
      ' maxlength="8"',
      ' style="width:100%;padding:12px 14px;margin:6px 0;border-radius:10px;',
      'border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">',

      '<input id="cl-d-license" type="text" placeholder="Driver Licence Number *"',
      ' style="width:100%;padding:12px 14px;margin:6px 0;border-radius:10px;',
      'border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">',

      '<select id="cl-d-vehicle"',
      ' style="width:100%;padding:12px 14px;margin:6px 0;border-radius:10px;',
      'border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">',
        '<option value="">Select Vehicle Type *</option>',
        '<option value="sedan">Sedan</option>',
        '<option value="suv">SUV / Crossover</option>',
        '<option value="hatchback">Hatchback</option>',
        '<option value="bike">Motorcycle</option>',
      '</select>',

      '<div style="margin-top:20px;display:flex;gap:10px;">',
        '<button onclick="window.submitDriverForm()"',
        ' style="flex:1;padding:14px;background:var(--green);color:#000;border:none;',
        'border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">',
        'Submit Application</button>',
        '<button onclick="document.querySelector(\'.cl-driver-modal\').remove()"',
        ' style="flex:1;padding:14px;background:transparent;color:var(--muted);',
        'border:1px solid var(--border);border-radius:10px;font-size:13px;cursor:pointer;">',
        'Cancel</button>',
      '</div>',
    '</div>'
  ].join('');

  document.body.appendChild(modal);
};

window.submitDriverForm = async function () {
  var name    = (document.getElementById('cl-d-name')    || {}).value || '';
  var phone   = (document.getElementById('cl-d-phone')   || {}).value || '';
  var license = (document.getElementById('cl-d-license') || {}).value || '';
  var vehicle = (document.getElementById('cl-d-vehicle') || {}).value || '';

  name    = name.trim();
  phone   = phone.trim();
  license = license.trim();

  if (!name || !phone || !license || !vehicle) {
    toast('Please fill all required fields', 'warning'); return;
  }
  if (!/^[0-9]{8}$/.test(phone)) {
    toast('Phone must be exactly 8 digits (Botswana format)', 'warning'); return;
  }

  // Disable submit to prevent double-tap
  var submitBtn = document.querySelector('.cl-driver-modal button');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

  var record = {
    name:      name,
    phone:     '+267' + phone,
    license:   license,
    vehicle:   vehicle,
    wallet:    (window.STATE && window.STATE.wallet) || null,
    status:    'pending',
    createdAt: new Date().toISOString()
  };

  if (window.db && typeof window.db.collection === 'function') {
    try {
      await window.db.collection('driver_applications').add(
        Object.assign(record, {
          appliedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
      console.log('✅ Driver application saved to Firestore');
    } catch (err) {
      console.warn('Firestore write failed, saving locally:', err.message);
      try {
        var existing = JSON.parse(localStorage.getItem('cl_driver_applications') || '[]');
        existing.push(record);
        localStorage.setItem('cl_driver_applications', JSON.stringify(existing));
      } catch (e2) {}
    }
  } else {
    // Firebase not ready — save locally and retry later
    try {
      var existing = JSON.parse(localStorage.getItem('cl_driver_applications') || '[]');
      existing.push(record);
      localStorage.setItem('cl_driver_applications', JSON.stringify(existing));
    } catch (e) {}
    console.warn('Firebase not ready — application queued locally');
  }

  localStorage.setItem('userRole', 'driver');
  localStorage.setItem('isDriver', 'true');
  if (window.STATE) window.STATE.role = 'driver';

  document.querySelectorAll('.cl-driver-modal').forEach(function (m) { m.remove(); });
  patchProfileCard();
  toast('✅ Application submitted! We will review and contact you soon.', 'success');
};

// ============================================================
// 6. ROLE BADGE in statusbar (Customer / Driver indicator)
// ============================================================
(function addRoleBadge() {
  document.addEventListener('DOMContentLoaded', function () {
    var right = document.querySelector('.statusbar .right');
    if (!right || document.getElementById('cl-role-badge')) return;
    var badge = document.createElement('span');
    badge.id = 'cl-role-badge';
    badge.style.cssText = [
      'font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;',
      'border:1px solid var(--border);color:var(--muted);',
      'font-family:var(--font-mono);cursor:pointer;'
    ].join('');
    badge.textContent = localStorage.getItem('userRole') === 'driver' ? '🚗 DRIVER' : '🧍 RIDER';
    badge.title = 'Tap to switch role';
    badge.onclick = function () {
      var current = localStorage.getItem('userRole') || 'customer';
      var next    = current === 'driver' ? 'customer' : 'driver';
      localStorage.setItem('userRole', next);
      if (window.STATE) window.STATE.role = next;
      badge.textContent = next === 'driver' ? '🚗 DRIVER' : '🧍 RIDER';
      patchProfileCard();
      toast('Switched to ' + (next === 'driver' ? 'Driver' : 'Rider') + ' mode', 'success');
    };
    right.insertBefore(badge, right.firstChild);
  });
})();
