// ============================================================
// PATCH 11 — PHASE 2: REAL PROFILE PAGE
// ============================================================
//
// Backend for this already exists (patch10): PATCH /api/auth/
// profile and GET /api/rides/mine. This patch wires the actual
// UI to them:
//
// 1. Logged-in profile card gets a real editable name field
//    (saves via PATCH /api/auth/profile).
// 2. The "My KPIs" card's ride count now reflects real ride
//    data from the server instead of local-only STATE.
// 3. A new "My Rides" card lists real ride history from
//    GET /api/rides/mine — pickup, dropoff, fare, status.
// 4. The top profile header (name/sub) reflects the real
//    logged-in account instead of a static placeholder.
//
// This patch edits frontend/index.html AND root index.html
// (which is currently a synced copy — see Phase 0). Both are
// patched identically so they don't drift apart again.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

function safeReplace(relPath, oldStr, newStr, label) {
    const full = p(relPath);
    if (!fs.existsSync(full)) {
        console.log("✗ MISSING FILE, skipped: " + relPath + " (" + label + ")");
        return false;
    }
    let content = fs.readFileSync(full, "utf8");
    if (!content.includes(oldStr)) {
        console.log("✗ ANCHOR NOT FOUND, skipped: " + relPath + " (" + label + ") — needs manual review");
        return false;
    }
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(full, content, "utf8");
    console.log("✓ patched " + relPath + " (" + label + ")");
    return true;
}

const TARGET_FILES = ["frontend/index.html", "index.html"];

// ------------------------------------------------------------
// 1. Editable name field in the logged-in account card
// ------------------------------------------------------------

const OLD_LOGGED_IN_BLOCK = `    <div id="accountLoggedIn" style="display:none">
      <div style="font-weight:700" id="acc-loggedin-name"></div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px" id="acc-loggedin-phone"></div>
      <button class="btn btn-outline" onclick="clAuthLogout()">Log out</button>
    </div>`;

const NEW_LOGGED_IN_BLOCK = `    <div id="accountLoggedIn" style="display:none">
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px" id="acc-loggedin-phone"></div>
      <input class="input" id="acc-edit-name" placeholder="Your name" style="margin-bottom:8px"/>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary" style="flex:1" onclick="clSaveProfileName()">Save name</button>
        <button class="btn btn-outline" style="flex:1" onclick="clAuthLogout()">Log out</button>
      </div>
    </div>`;

// ------------------------------------------------------------
// 2. New "My Rides" card, inserted right after the KPI card
// ------------------------------------------------------------

const OLD_KPI_CARD_END = `  <div class="card">
    <div class="card-title" style="margin-bottom:12px">📊 My KPIs</div>
    <div class="wallet-bar">
      <div class="bal-card"><div class="val" id="kpi-rides">0</div><div class="lbl">Rides</div></div>
      <div class="bal-card"><div class="val" id="kpi-thb">0</div><div class="lbl">THB</div></div>
      <div class="bal-card"><div class="val" id="kpi-rating">—</div><div class="lbl">Avg ⭐</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title" style="margin-bottom:12px">⚙ Settings</div>`;

const NEW_KPI_CARD_END = `  <div class="card">
    <div class="card-title" style="margin-bottom:12px">📊 My KPIs</div>
    <div class="wallet-bar">
      <div class="bal-card"><div class="val" id="kpi-rides">0</div><div class="lbl">Rides</div></div>
      <div class="bal-card"><div class="val" id="kpi-thb">0</div><div class="lbl">THB</div></div>
      <div class="bal-card"><div class="val" id="kpi-rating">—</div><div class="lbl">Avg ⭐</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title" style="margin-bottom:12px">🚕 My Rides</div>
    <div id="myRidesList" style="display:flex;flex-direction:column;gap:8px">
      <div style="padding:12px;color:var(--muted);font-size:13px">Log in to see your ride history.</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title" style="margin-bottom:12px">⚙ Settings</div>`;

// ------------------------------------------------------------
// 3. updateProfileKPI — real ride count when logged in
// ------------------------------------------------------------

const OLD_UPDATE_KPI = `function updateProfileKPI(){
  document.getElementById('kpi-rides').textContent = STATE.totalRides;
  document.getElementById('kpi-thb').textContent = STATE.totalEarned.toFixed(1);
  document.getElementById('kpi-rating').textContent = STATE.avgRating || '—';
}`;

const NEW_UPDATE_KPI = `function updateProfileKPI(){
  document.getElementById('kpi-thb').textContent = STATE.totalEarned.toFixed(1);
  document.getElementById('kpi-rating').textContent = STATE.avgRating || '—';

  const token = localStorage.getItem('cl_token');
  if(!token){
    document.getElementById('kpi-rides').textContent = STATE.totalRides;
    return;
  }

  fetch('/api/rides/mine', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json())
    .then(data => {
      if(data.success){
        document.getElementById('kpi-rides').textContent = data.count;
      } else {
        document.getElementById('kpi-rides').textContent = STATE.totalRides;
      }
    })
    .catch(() => { document.getElementById('kpi-rides').textContent = STATE.totalRides; });
}`;

// ------------------------------------------------------------
// 4. renderAccountUI — real header, prefill name field, load rides
// ------------------------------------------------------------

const OLD_RENDER_ACCOUNT_UI = `  function renderAccountUI(){
    var accEl = document.getElementById('accountCard');
    if(!accEl) return;
    var raw = localStorage.getItem('cl_account');
    var loggedOutEl = document.getElementById('accountLoggedOut');
    var loggedInEl = document.getElementById('accountLoggedIn');
    if(raw){
      var account = JSON.parse(raw);
      loggedOutEl.style.display = 'none';
      loggedInEl.style.display = 'block';
      document.getElementById('acc-loggedin-name').textContent = account.name;
      document.getElementById('acc-loggedin-phone').textContent = account.phone;
      // Prefill the driver-application form with real account details
      // so applying doesn't require retyping name/phone.
      var applyName = document.getElementById('apply-name');
      var applyPhone = document.getElementById('apply-phone');
      if(applyName && !applyName.value) applyName.value = account.name;
      if(applyPhone && !applyPhone.value) applyPhone.value = account.phone;
    } else {
      loggedOutEl.style.display = 'block';
      loggedInEl.style.display = 'none';
    }
  }`;

const NEW_RENDER_ACCOUNT_UI = `  function renderAccountUI(){
    var accEl = document.getElementById('accountCard');
    if(!accEl) return;
    var raw = localStorage.getItem('cl_account');
    var loggedOutEl = document.getElementById('accountLoggedOut');
    var loggedInEl = document.getElementById('accountLoggedIn');
    var profileNameEl = document.getElementById('profile-name');
    var profileSubEl = document.getElementById('profile-sub');
    if(raw){
      var account = JSON.parse(raw);
      loggedOutEl.style.display = 'none';
      loggedInEl.style.display = 'block';
      document.getElementById('acc-loggedin-phone').textContent = account.phone;
      var editNameEl = document.getElementById('acc-edit-name');
      if(editNameEl && document.activeElement !== editNameEl) editNameEl.value = account.name || '';
      if(profileNameEl) profileNameEl.textContent = account.name || account.phone;
      if(profileSubEl) profileSubEl.textContent = account.phone;
      // Prefill the driver-application form with real account details
      // so applying doesn't require retyping name/phone.
      var applyName = document.getElementById('apply-name');
      var applyPhone = document.getElementById('apply-phone');
      if(applyName && !applyName.value) applyName.value = account.name;
      if(applyPhone && !applyPhone.value) applyPhone.value = account.phone;
      renderMyRides();
    } else {
      loggedOutEl.style.display = 'block';
      loggedInEl.style.display = 'none';
      if(profileNameEl) profileNameEl.textContent = 'Not connected';
      if(profileSubEl) profileSubEl.textContent = 'Log in to see your profile';
      var listEl = document.getElementById('myRidesList');
      if(listEl) listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">Log in to see your ride history.</div>';
    }
  }

  window.clSaveProfileName = async function(){
    var token = localStorage.getItem('cl_token');
    if(!token){ toast('Log in first', 'warning'); return; }
    var name = document.getElementById('acc-edit-name').value.trim();
    if(!name){ toast('Name cannot be empty', 'warning'); return; }
    try{
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if(!data.success){ toast(data.error || 'Could not save name', 'error'); return; }
      localStorage.setItem('cl_account', JSON.stringify(data.account));
      toast('Name updated', 'success');
      renderAccountUI();
    }catch(e){ toast('Network error saving name', 'error'); }
  };

  function renderMyRides(){
    var listEl = document.getElementById('myRidesList');
    if(!listEl) return;
    var token = localStorage.getItem('cl_token');
    if(!token){
      listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">Log in to see your ride history.</div>';
      return;
    }
    listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">Loading your rides…</div>';
    fetch('/api/rides/mine', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        if(!data.success){
          listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">Could not load ride history.</div>';
          return;
        }
        if(data.rides.length === 0){
          listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">No rides yet — request your first ride from Home.</div>';
          return;
        }
        var sorted = data.rides.slice().sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
        listEl.innerHTML = sorted.map(function(ride){
          var date = new Date(ride.createdAt).toLocaleDateString();
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--surface,rgba(255,255,255,.03));border-radius:10px">' +
            '<div><div style="font-weight:600;font-size:13px">' + ride.pickup + ' → ' + ride.dropoff + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + date + ' · ' + ride.status + '</div></div>' +
            '<div style="font-weight:700;color:var(--gold-l,var(--gold))">P' + ride.fare + '</div></div>';
        }).join('');
      })
      .catch(() => {
        listEl.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px">Could not load ride history — check your connection.</div>';
      });
  }`;

// ------------------------------------------------------------
// Apply to both frontend/index.html and root index.html
// ------------------------------------------------------------

for (const file of TARGET_FILES) {
    safeReplace(file, OLD_LOGGED_IN_BLOCK, NEW_LOGGED_IN_BLOCK, "editable name field");
    safeReplace(file, OLD_KPI_CARD_END, NEW_KPI_CARD_END, "insert My Rides card");
    safeReplace(file, OLD_UPDATE_KPI, NEW_UPDATE_KPI, "real ride count in KPI");
    safeReplace(file, OLD_RENDER_ACCOUNT_UI, NEW_RENDER_ACCOUNT_UI, "real profile header + save name + render rides");
}

console.log("");
console.log("Patch 11 complete — Phase 2 (real profile page UI) applied.");
console.log("Reload the app, log in on the Profile tab, edit your name,");
console.log("save it, and request a ride — it should show up under My Rides.");
