import subprocess, re

print("CABLINK BLOCK 6 — WIRE FRONTEND TO REAL /accept /complete ROUTES")
print("="*65)

TARGET = 'frontend/index.html'
with open(TARGET, 'r', encoding='utf-8') as f:
    html = f.read()

changed = False

# Fix 1: pollRideStatus — it currently checks ride.status from GET /api/rides/:id
# which is fine since that route is untouched and real. No change needed there.
# It just needs the STATUS VALUES to match what the backend actually returns:
# SEARCHING / ACCEPTED / COMPLETED (uppercase), not 'accepted'/'assigned'/'completed' lowercase.
OLD_POLL_CHECK = """      const status = (ride.status || '').toLowerCase();
      console.log('Ride status:', status);
      if(status === 'accepted' || status === 'assigned'){"""
NEW_POLL_CHECK = """      const status = (ride.status || '').toUpperCase();
      console.log('Ride status:', status);
      if(status === 'ACCEPTED' || status === 'ASSIGNED'){"""

if OLD_POLL_CHECK in html:
    html = html.replace(OLD_POLL_CHECK, NEW_POLL_CHECK)
    print("FIX 1a: pollRideStatus status-check switched to uppercase match")
    changed = True
else:
    print("SKIP 1a: exact block not found (may already be fixed)")

html = html.replace("} else if(status === 'arrived'){", "} else if(status === 'ARRIVED'){")
html = html.replace("} else if(status === 'completed'){", "} else if(status === 'COMPLETED'){")
html = html.replace("} else if(status === 'cancelled'){", "} else if(status === 'CANCELLED'){")
print("FIX 1b: remaining status checks switched to uppercase")

# Fix 2: acceptRealRequest — currently does a generic PATCH with {status:'accepted', driverId}
# Needs to call the real /accept endpoint instead.
OLD_ACCEPT = """async function acceptRealRequest(rideId){
  try{
    await fetch('/api/rides/' + rideId, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status: 'accepted', driverId: STATE.driverId })
    });"""
NEW_ACCEPT = """async function acceptRealRequest(rideId){
  try{
    await fetch('/api/rides/' + rideId + '/accept', {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ driverId: STATE.driverId })
    });"""

if OLD_ACCEPT in html:
    html = html.replace(OLD_ACCEPT, NEW_ACCEPT)
    print("FIX 2: acceptRealRequest now calls real /accept endpoint")
    changed = True
else:
    print("SKIP 2: exact block not found (may already be fixed)")

# Fix 3: add a real completeRide trigger the driver can press (currently nothing calls /complete)
# We add a "Complete Trip" button action wired to the real endpoint, callable once a ride is accepted.
if 'async function completeRealRide' not in html:
    addition = """

async function completeRealRide(rideId){
  try{
    const res = await fetch('/api/rides/' + rideId + '/complete', { method: 'PATCH' });
    const data = await res.json();
    console.log('Ride completed on backend:', data);
    return data.ride;
  } catch(e){
    console.error('Complete failed', e);
    toast('Could not complete ride', 'error');
    return null;
  }
}
"""
    # insert right after acceptRealRequest function
    idx = html.find("async function acceptRealRequest")
    end_idx = html.find("\n}\n", idx) + len("\n}\n")
    html = html[:end_idx] + addition + html[end_idx:]
    print("FIX 3: added completeRealRide(rideId) helper function")
    changed = True
else:
    print("SKIP 3: completeRealRide already exists")

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\nChanged: {changed}")
print("="*65)
print("NEXT: reload the app in browser, open two tabs (driver + passenger),")
print("      book a ride in one, go online + accept in the other, confirm it")
print("      flips to 'Driver assigned' automatically within ~3-4 seconds.")
print("="*65)
