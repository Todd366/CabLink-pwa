const fs = require('fs');

const FILE = 'index.html';
const BACKUP = 'index.html.bak_before_real_wiring';

let content = fs.readFileSync(FILE, 'utf8');
fs.writeFileSync(BACKUP, content);
console.log('Backup saved to', BACKUP);

// ---- 1. Replace bookRide() so it finishes the job: books for real, then watches the ride ----
const bookRideRe = /async function bookRide\(\)\{[\s\S]*?(?=\nfunction simulateRide\(\)\{)/;

const newBookRide = `async function bookRide(){
  const pickup = document.getElementById('pickup').value.trim();
  const dropoff = document.getElementById('dropoff').value.trim();
  if(!pickup || !dropoff){ toast('Please enter pickup and drop-off locations', 'warning'); return; }
  if(STATE.inRide){ toast('Ride already in progress', 'warning'); return; }

  const payload = {
    pickup, dropoff,
    fare: STATE.selectedFare || 0,
    type: STATE.selectedRideType || 'standard',
    timestamp: Date.now()
  };

  STATE.inRide = true; STATE.rideReady = false;
  updateMapRoute();
  document.getElementById('rideIdRow').style.display = 'block';
  document.getElementById('chatSection').style.display = 'block';
  document.getElementById('cancelBtn').style.display = 'block';
  document.getElementById('bookBtn').disabled = true;
  document.getElementById('simBtn').disabled = true;
  setStatusPip('yellow'); setStatusLabel('🔍 Requesting ride…');
  showRideProgressBar('FINDING DRIVER', 10);

  try{
    const response = await fetch('/api/rides', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log('REAL RIDE CREATED:', data);
    const ride = data.ride || data;
    STATE.rideId = ride.id || ride._id || ('CL-' + Date.now());
    document.getElementById('rideId').textContent = STATE.rideId;
    toast('🚕 Ride requested — waiting for a driver', 'success');
    pollRideStatus(STATE.rideId);
  } catch(e){
    console.error(e);
    toast('Backend unavailable — could not book ride', 'error');
    resetRideUI();
  }
}

let _rideStatusPoller = null;
async function pollRideStatus(rideId){
  clearInterval(_rideStatusPoller);
  _rideStatusPoller = setInterval(async () => {
    try{
      const res = await fetch('/api/rides/' + rideId);
      if(!res.ok) return;
      const data = await res.json();
      const ride = data.ride || data;
      const status = (ride.status || '').toLowerCase();
      console.log('Ride status:', status);
      if(status === 'accepted' || status === 'assigned'){
        setStatusPip('green'); setStatusLabel('🚗 Driver assigned! En route…');
        showRideProgressBar('DRIVER EN ROUTE', 40);
      } else if(status === 'arrived'){
        clearInterval(_rideStatusPoller);
        showArrived();
      } else if(status === 'completed'){
        clearInterval(_rideStatusPoller);
        completeRide();
      } else if(status === 'cancelled'){
        clearInterval(_rideStatusPoller);
        toast('Ride was cancelled', 'warning');
        resetRideUI();
      }
    } catch(e){ /* keep polling quietly */ }
  }, 3000);
}
`;

if(bookRideRe.test(content)){
  content = content.replace(bookRideRe, newBookRide);
  console.log('✓ bookRide() replaced with real-flow version + status polling');
} else {
  console.log('✗ Could not find bookRide() block — no changes made to it. Check index.html manually.');
}

// ---- 2. Replace toggleDriverMode() so going online actually registers with the backend ----
const toggleRe = /function toggleDriverMode\(\)\{[\s\S]*?(?=\nfunction addDriverRequest\(\)\{)/;

const newToggle = `async function toggleDriverMode(){
  STATE.driverOnline = !STATE.driverOnline;
  const btn = document.getElementById('driverModeBtn');
  if(!STATE.driverId){
    STATE.driverId = localStorage.getItem('cl6_driverId') || ('DRV-' + Math.random().toString(36).substr(2,8).toUpperCase());
    localStorage.setItem('cl6_driverId', STATE.driverId);
  }
  try{
    const endpoint = STATE.driverOnline ? '/api/drivers/online' : '/api/drivers/offline';
    await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ driverId: STATE.driverId })
    });
  } catch(e){ console.error('Driver status update failed', e); }
  btn.textContent = STATE.driverOnline ? '🔴 Go offline' : '🟢 Go online';
  btn.className = 'btn btn-sm ' + (STATE.driverOnline ? 'btn-danger' : 'btn-outline');
  if(STATE.driverOnline){ toast('You are now online and accepting rides!', 'success'); pollForRideRequests(); }
  else { toast('You are now offline.', 'warning'); clearInterval(_driverRequestPoller); }
  updateDriverUI();
}

let _driverRequestPoller = null;
async function pollForRideRequests(){
  clearInterval(_driverRequestPoller);
  _driverRequestPoller = setInterval(async () => {
    if(!STATE.driverOnline) return;
    try{
      const res = await fetch('/api/rides');
      if(!res.ok) return;
      const data = await res.json();
      const rides = data.rides || data;
      (Array.isArray(rides) ? rides : []).filter(r => {
        const s = (r.status||'').toLowerCase();
        return s === 'pending' || s === 'requested' || s === '';
      }).forEach(r => {
        if(document.getElementById('req-' + r.id)) return;
        renderIncomingRequest(r);
      });
    } catch(e){ /* silent */ }
  }, 4000);
}

function renderIncomingRequest(r){
  STATE.driverRequests++;
  const container = document.getElementById('driverRequests');
  const div = document.createElement('div');
  div.className = 'request-card pending'; div.id = 'req-' + r.id;
  div.innerHTML = \`<div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>\${r.id}</strong><span style="color:var(--gold-l);font-weight:700">\${r.fare||''} BWP</span></div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px">📍 \${r.pickup||''} → 🏁 \${r.dropoff||''}</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-green btn-sm" onclick="acceptRealRequest('\${r.id}')">✓ Accept</button>
      <button class="btn btn-outline btn-sm" onclick="document.getElementById('req-\${r.id}').remove()">✗ Pass</button>
    </div>\`;
  if(container.firstChild?.textContent?.includes('online')) container.innerHTML = '';
  container.prepend(div);
  updateDriverUI();
  toast('🚗 New ride request received', 'warning'); haptic();
}

async function acceptRealRequest(rideId){
  try{
    await fetch('/api/rides/' + rideId, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status: 'accepted', driverId: STATE.driverId })
    });
    document.getElementById('req-' + rideId)?.remove();
    STATE.driverAccepted++; STATE.driverThb += 1; updateDriverUI();
    toast('Ride accepted! Earn 1 THB when complete.', 'success');
  } catch(e){ toast('Could not accept ride', 'error'); }
}
`;

if(toggleRe.test(content)){
  content = content.replace(toggleRe, newToggle);
  console.log('✓ toggleDriverMode() replaced with real online/offline API calls + live request polling');
} else {
  console.log('✗ Could not find toggleDriverMode() block — no changes made to it. Check index.html manually.');
}

fs.writeFileSync(FILE, content);
console.log('\nDone. index.html updated. Original saved as', BACKUP);
