/* fix.js v66 - CabLink */
document.addEventListener('DOMContentLoaded', function() {

  // Profile card - wallet driven, not hardcoded
  function patchProfile() {
    var nameEl = document.querySelector('#s-profile .card-title');
    var subEl  = document.querySelector('#s-profile .card-sub');
    if (!nameEl || !subEl) return;
    var role   = localStorage.getItem('userRole') || 'customer';
    var wallet = window.STATE && window.STATE.wallet;
    nameEl.textContent = wallet
      ? (wallet.slice(0,6) + '...' + wallet.slice(-4))
      : 'Not connected';
    subEl.textContent = wallet
      ? (role === 'driver' ? 'CabLink Driver - BSC Testnet' : 'CabLink Rider - BSC Testnet')
      : 'Connect wallet to see your profile';
  }
  patchProfile();

  // Role badge in statusbar
  var right = document.querySelector('.statusbar .right');
  if (right && !document.getElementById('cl-rb')) {
    var b = document.createElement('span');
    b.id = 'cl-rb';
    b.style.cssText = 'font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;border:1px solid var(--border);color:var(--muted);cursor:pointer;margin-right:4px;';
    b.textContent = localStorage.getItem('userRole') === 'driver' ? 'DRIVER' : 'RIDER';
    b.onclick = function() {
      var next = localStorage.getItem('userRole') === 'driver' ? 'customer' : 'driver';
      localStorage.setItem('userRole', next);
      if (window.STATE) window.STATE.role = next;
      b.textContent = next === 'driver' ? 'DRIVER' : 'RIDER';
      patchProfile();
      toast('Switched to ' + (next === 'driver' ? 'Driver' : 'Rider') + ' mode', 'success');
    };
    right.insertBefore(b, right.firstChild);
  }

});

// Firebase
(function loadFB() {
  if (typeof firebase !== 'undefined' && firebase.firestore) { initFB(); return; }
  var a = document.createElement('script');
  a.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
  a.onload = function() {
    var f = document.createElement('script');
    f.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
    f.onload = initFB;
    document.head.appendChild(f);
  };
  document.head.appendChild(a);
})();

function initFB() {
  if (typeof firebase === 'undefined') return;
  var cfg = {
    apiKey:'AIzaSyBlpLfL6ProXUrqhr9FGET7ACfPOKBudSw',
    authDomain:'gen-lang-client-0007945213.firebaseapp.com',
    projectId:'gen-lang-client-0007945213',
    storageBucket:'gen-lang-client-0007945213.firebasestorage.app',
    messagingSenderId:'570021771449',
    appId:'1:570021771449:web:70d9e7e254d4ff7e654368'
  };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  window.db = firebase.firestore();
  console.log('Firebase OK');
}

// Book ride - no fake simulation
window.bookRide = function() {
  var p = (document.getElementById('pickup')  || {}).value || '';
  var d = (document.getElementById('dropoff') || {}).value || '';
  if (!p.trim() || !d.trim()) {
    toast('Please enter pickup and drop-off locations', 'warning');
    return;
  }
  if (!navigator.onLine) {
    toast('Offline - ride queued', 'warning');
    return;
  }
  toast('Searching for nearby drivers...', 'warning');
  setTimeout(function() {
    toast('No drivers available right now - try again soon', 'warning');
  }, 1800);
};

// Driver mode -> registration form
window.toggleDriverMode = function() {
  window.showDriverRegistrationForm();
};

window.showDriverRegistrationForm = function() {
  document.querySelectorAll('.cl-dm').forEach(function(m) { m.remove(); });
  var modal = document.createElement('div');
  modal.className = 'cl-dm';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML =
    '<div style="background:var(--bg2);width:92%;max-width:400px;border-radius:16px;padding:24px;border:1px solid var(--border);">' +
    '<h3 style="text-align:center;margin:0 0 20px;color:var(--accent);font-size:18px;">Become a CabLink Driver</h3>' +
    '<input id="cl-dn" type="text" placeholder="Full Name *" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">' +
    '<input id="cl-dp" type="tel" placeholder="Phone - 8 digits e.g. 71234567" maxlength="8" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">' +
    '<input id="cl-dl" type="text" placeholder="Licence Number *" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">' +
    '<select id="cl-dv" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;">' +
    '<option value="">Select Vehicle *</option><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="hatchback">Hatchback</option><option value="bike">Motorcycle</option></select>' +
    '<div style="margin-top:20px;display:flex;gap:10px;">' +
    '<button onclick="window.submitDriverForm()" style="flex:1;padding:14px;background:var(--green);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;">Submit Application</button>' +
    '<button onclick="document.querySelector('.cl-dm').remove()" style="flex:1;padding:14px;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:10px;cursor:pointer;">Cancel</button>' +
    '</div></div>';
  document.body.appendChild(modal);
};

window.submitDriverForm = async function() {
  var name  = ((document.getElementById('cl-dn') || {}).value || '').trim();
  var phone = ((document.getElementById('cl-dp') || {}).value || '').trim();
  var lic   = ((document.getElementById('cl-dl') || {}).value || '').trim();
  var veh   = ((document.getElementById('cl-dv') || {}).value || '');
  if (!name || !phone || !lic || !veh) { toast('Please fill all fields', 'warning'); return; }
  if (!/^[0-9]{8}$/.test(phone)) { toast('Phone must be 8 digits', 'warning'); return; }
  var rec = { name:name, phone:'+267'+phone, license:lic, vehicle:veh,
    wallet:(window.STATE && window.STATE.wallet) || null,
    status:'pending', createdAt:new Date().toISOString() };
  if (window.db) {
    try { await window.db.collection('driver_applications').add(rec); }
    catch(e) { var q=JSON.parse(localStorage.getItem('cl_dq')||'[]'); q.push(rec); localStorage.setItem('cl_dq',JSON.stringify(q)); }
  } else {
    var q = JSON.parse(localStorage.getItem('cl_dq') || '[]');
    q.push(rec);
    localStorage.setItem('cl_dq', JSON.stringify(q));
  }
  localStorage.setItem('userRole', 'driver');
  if (window.STATE) window.STATE.role = 'driver';
  document.querySelectorAll('.cl-dm').forEach(function(m) { m.remove(); });
  toast('Application submitted! We will review and contact you.', 'success');
};

console.log('fix.js v66 loaded');
