import re

print("CABLINK BLOCK 7 — REAL FARE ENGINE + REAL DRIVER MAP + REAL GEOLOCATION")
print("="*70)

TARGET = 'frontend/index.html'
with open(TARGET, 'r', encoding='utf-8') as f:
    html = f.read()

changes = []

# ─────────────────────────────────────────────────────────────
# 1. Insert haversine distance + real fare engine, right before calcTotalFare
# ─────────────────────────────────────────────────────────────
FARE_ENGINE = '''
// ═══ REAL FARE ENGINE — replaces flat pricing ═══
const BOTSWANA_ECONOMY = {
  fuelPrice: 14.80,       // BWP per litre
  maintenancePerKm: 0.45,
  tyresPerKm: 0.18,
  servicePerKm: 0.22,
  driverMarginPct: 0.35,
  platformFeePct: 0.12,
  minimumFare: 15
};
const VEHICLE_CONSUMPTION = { // km per litre
  standard: 14, premium: 10, xl: 8, moto: 28, eco: 18, quiet: 12
};

function toRad(v){ return v * Math.PI / 180; }
function haversineKm(a, b){
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}

function resolveLandmark(text, fallback){
  if(!text) return fallback;
  const lower = text.toLowerCase();
  for(const key in LANDMARKS){ if(LANDMARKS[key].name.toLowerCase().includes(lower.split(' ')[0])) return LANDMARKS[key]; }
  if(lower.includes('game')) return LANDMARKS.gameCity;
  if(lower.includes('main')) return LANDMARKS.mainMall;
  if(lower.includes('airport')) return LANDMARKS.airport;
  if(lower.includes('river')) return LANDMARKS.riverwalk;
  if(lower.includes('ub')||lower.includes('university')) return LANDMARKS.ub;
  if(lower.includes('molapo')) return LANDMARKS.molapo;
  if(lower.includes('kgale')) return LANDMARKS.kgale;
  return fallback;
}

function getCurrentDistanceKm(){
  const pu = resolveLandmark(document.getElementById('pickup')?.value, LANDMARKS.bstmHQ);
  const doff = resolveLandmark(document.getElementById('dropoff')?.value, LANDMARKS.gameCity);
  return haversineKm(pu, doff);
}

function calcRealFare(type, distanceKm){
  const cfg = BOTSWANA_ECONOMY;
  const consumption = VEHICLE_CONSUMPTION[type] || VEHICLE_CONSUMPTION.standard;
  const fuelUsed = distanceKm / consumption;
  const fuelCost = fuelUsed * cfg.fuelPrice;
  const maintenance = distanceKm * cfg.maintenancePerKm;
  const tyres = distanceKm * cfg.tyresPerKm;
  const service = distanceKm * cfg.servicePerKm;
  const operatingCost = fuelCost + maintenance + tyres + service;
  const driverMargin = operatingCost * cfg.driverMarginPct;
  const subtotal = operatingCost + driverMargin;
  const platformFee = subtotal * cfg.platformFeePct;
  let total = subtotal + platformFee;
  total = Math.max(total, cfg.minimumFare);
  return {
    distanceKm: +distanceKm.toFixed(2),
    fuelCost: +fuelCost.toFixed(2),
    maintenance: +maintenance.toFixed(2),
    tyres: +tyres.toFixed(2),
    service: +service.toFixed(2),
    driverMargin: +driverMargin.toFixed(2),
    platformFee: +platformFee.toFixed(2),
    total: Math.round(total)
  };
}

'''

pattern1 = re.compile(r'function calcTotalFare\(\)\{[\s\S]*?\n\}\n', re.MULTILINE)
if pattern1.search(html):
    html = pattern1.sub(FARE_ENGINE + '''function calcTotalFare(){
  const distanceKm = getCurrentDistanceKm();
  const breakdown = calcRealFare(STATE.selectedRideType, distanceKm);
  let total = breakdown.total;
  total += STATE.stops.length * 5;
  if(STATE.surgeActive) total = Math.round(total * STATE.surgeMultiplier);
  return total;
}
''', html, count=1)
    changes.append("FIX 1: real fare engine inserted, calcTotalFare now distance-based")
else:
    print("ABORT: could not find calcTotalFare() — no changes made. Paste current file section to Claude.")
    exit(1)

# ─────────────────────────────────────────────────────────────
# 2. Replace updateFareBreakdown to show real distance + cost breakdown
# ─────────────────────────────────────────────────────────────
pattern2 = re.compile(r'function updateFareBreakdown\(\)\{[\s\S]*?\n\}\n', re.MULTILINE)
NEW_BREAKDOWN = '''function updateFareBreakdown(){
  const distanceKm = getCurrentDistanceKm();
  const breakdown = calcRealFare(STATE.selectedRideType, distanceKm);
  const stops = STATE.stops.length*5;
  const surgeAdd = STATE.surgeActive ? Math.round(breakdown.total*(STATE.surgeMultiplier-1)) : 0;
  const total = breakdown.total + stops + surgeAdd;
  document.getElementById('fb-base').textContent = breakdown.total + ' BWP (' + breakdown.distanceKm + ' km)';
  document.getElementById('fb-stops').textContent = stops + ' BWP';
  document.getElementById('fb-stops-row').style.display = stops ? 'flex' : 'none';
  document.getElementById('fb-surge').textContent = surgeAdd + ' BWP';
  document.getElementById('fb-surge-row').style.display = STATE.surgeActive ? 'flex' : 'none';
  document.getElementById('fb-total').textContent = total + ' BWP';
  document.getElementById('sm-normal').textContent = breakdown.total + ' BWP';
  document.getElementById('sm-surge').textContent = (breakdown.total+surgeAdd) + ' BWP';
  // update the live price shown on each ride-type card
  document.querySelectorAll('.ride-type-card').forEach(card => {
    const t = card.dataset.type;
    const b = calcRealFare(t, distanceKm);
    const priceEl = card.querySelector('.price');
    if(priceEl) priceEl.textContent = b.total + ' BWP';
  });
}
'''
if pattern2.search(html):
    html = pattern2.sub(NEW_BREAKDOWN, html, count=1)
    changes.append("FIX 2: updateFareBreakdown now shows real distance-based cost, updates all ride-type card prices live")
else:
    print("WARNING: updateFareBreakdown() not found — skipped (fare display may still show old values)")

# ─────────────────────────────────────────────────────────────
# 3. Wire pickup/dropoff inputs to recalculate fare + map on every keystroke
# ─────────────────────────────────────────────────────────────
if "id=\"pickup\" placeholder" in html and "cablinkInputsWired" not in html:
    html = html.replace(
        "</script>\n<div id=\"root\">",
        '''<script>
window.cablinkInputsWired = true;
document.addEventListener('DOMContentLoaded', () => {
  const pu = document.getElementById('pickup');
  const doff = document.getElementById('dropoff');
  const recalc = () => { updateMapRoute(); updateFareBreakdown(); };
  if(pu) pu.addEventListener('input', recalc);
  if(doff) doff.addEventListener('input', recalc);
});
</script>
</script>
<div id="root">''',
        1
    )
    changes.append("FIX 3: pickup/dropoff inputs now trigger live fare + map recalculation")
else:
    print("SKIP 3: input wiring already present or anchor not found")

# ─────────────────────────────────────────────────────────────
# 4. Remove fake nearbyDrivers markers, add real driver polling
# ─────────────────────────────────────────────────────────────
pattern4 = re.compile(
    r"  const nearbyDrivers = \[LANDMARKS\.molapo, LANDMARKS\.mainMall, LANDMARKS\.riverwalk\];\n"
    r"  driverMarkers = nearbyDrivers\.map\(l => L\.marker\(\[l\.lat \+ \(Math\.random\(\)-\.5\)\*\.01, l\.lng \+ \(Math\.random\(\)-\.5\)\*\.01\], \{\n"
    r"    icon:L\.divIcon\(\{html:'<div style=\"font-size:14px\">🚗</div>', className:'', iconSize:\[16,16\]\}\)\n"
    r"  \}\)\.addTo\(MAP\)\);\n"
)
if pattern4.search(html):
    html = pattern4.sub(
        "  driverMarkers = {}; // real markers populated by pollOnlineDrivers()\n"
        "  pollOnlineDrivers();\n"
        "  setInterval(pollOnlineDrivers, 5000);\n",
        html
    )
    changes.append("FIX 4a: fake nearbyDrivers block removed, replaced with real polling calls")
else:
    print("WARNING: fake nearbyDrivers block not found exactly — skipped (check manually)")

# Remove the leftover setInterval(driftDriverMarkers, 2800) call and the stub function
html = html.replace("  setInterval(driftDriverMarkers, 2800);\n", "")
html = re.sub(r"function driftDriverMarkers\(\)\{[^\n]*\}\n", "", html)

# Add the real pollOnlineDrivers function right after driverMarkers-related code, before recenterMap
pattern4b = re.compile(r"function recenterMap\(\)\{")
POLL_FN = '''function pollOnlineDrivers(){
  fetch('/api/drivers/online').then(r => r.json()).then(data => {
    const list = data.drivers || [];
    const seen = new Set();
    list.forEach(d => {
      seen.add(d.id);
      if(driverMarkers[d.id]){
        driverMarkers[d.id].setLatLng([d.lat, d.lng]);
      } else {
        driverMarkers[d.id] = L.marker([d.lat, d.lng], {
          icon: L.divIcon({html:'<div style="font-size:14px">🚗</div>', className:'', iconSize:[16,16]})
        }).addTo(MAP).bindPopup('Driver ' + d.id.slice(-4));
      }
    });
    Object.keys(driverMarkers).forEach(id => {
      if(!seen.has(id)){ MAP.removeLayer(driverMarkers[id]); delete driverMarkers[id]; }
    });
    const el = document.getElementById('mapDriverCount');
    if(el) el.textContent = list.length ? (list.length + ' driver' + (list.length===1?'':'s') + ' online') : 'No drivers online';
  }).catch(() => {
    const el = document.getElementById('mapDriverCount');
    if(el) el.textContent = 'Driver network unavailable';
  });
}
function recenterMap(){'''
if pattern4b.search(html):
    html = pattern4b.sub(POLL_FN, html, count=1)
    changes.append("FIX 4b: real pollOnlineDrivers() added — shows only actual online drivers, honest empty state")
else:
    print("WARNING: could not anchor pollOnlineDrivers insertion — skipped")

# ─────────────────────────────────────────────────────────────
# 5. Real geolocation capture in toggleDriverMode
# ─────────────────────────────────────────────────────────────
OLD_TOGGLE_FETCH = '''  try{
    const endpoint = STATE.driverOnline ? '/api/drivers/online' : '/api/drivers/offline';
    await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ driverId: STATE.driverId })
    });
  } catch(e){ console.error('Driver status update failed', e); }'''
NEW_TOGGLE_FETCH = '''  try{
    const endpoint = STATE.driverOnline ? '/api/drivers/online' : '/api/drivers/offline';
    let coords = {};
    if(STATE.driverOnline && navigator.geolocation){
      coords = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => { toast('Location unavailable — using default area', 'warning'); resolve({}); },
          { timeout: 5000 }
        );
      });
    }
    await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ driverId: STATE.driverId, lat: coords.lat, lng: coords.lng })
    });
  } catch(e){ console.error('Driver status update failed', e); }'''
if OLD_TOGGLE_FETCH in html:
    html = html.replace(OLD_TOGGLE_FETCH, NEW_TOGGLE_FETCH, 1)
    changes.append("FIX 5: toggleDriverMode now captures real phone GPS and sends it to backend")
else:
    print("WARNING: toggleDriverMode fetch block not found exactly — skipped (check manually)")

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(html)

print("\n".join(changes))
print(f"\nTotal fixes applied: {len(changes)} / 5")
print("="*70)
print("NEXT: reload the app, and:")
print("  1. Type different pickup/dropoff pairs — watch prices actually change per km")
print("  2. Go online as driver on a real phone (allow location permission when asked)")
print("  3. Check the map — it should show 'No drivers online' until one really is")
print("="*70)
