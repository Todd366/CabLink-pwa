import subprocess, os, re, shutil, time

print("CABLINK BLOCK 3 — WIRE REAL ACCEPT/COMPLETE ROUTES + CLEANUP")
print("="*65)

# ---------------------------------------------------------
# 1. Add get() to rideRepository.js
# ---------------------------------------------------------
REPO = 'backend/database/rideRepository.js'
with open(REPO, 'r', encoding='utf-8') as f:
    repo_src = f.read()

if 'get(id)' not in repo_src and 'get(id){' not in repo_src:
    repo_src = repo_src.replace(
        'update(id,data){',
        '''get(id){

let rides=load();

return rides.find(r=>r.id===id) || null;

},


update(id,data){'''
    )
    with open(REPO, 'w', encoding='utf-8') as f:
        f.write(repo_src)
    print(f"FIX: added get(id) to {REPO}")
else:
    print(f"SKIP: {REPO} already has get(id)")

# ---------------------------------------------------------
# 2. Add getRide() and updateRide() to rideService.js
# ---------------------------------------------------------
SERVICE = 'backend/services/rideService.js'
with open(SERVICE, 'r', encoding='utf-8') as f:
    service_src = f.read()

if 'function getRide' not in service_src:
    service_src = service_src.replace(
        'module.exports={',
        '''function getRide(id){

return repo.get(id);

}


function updateRide(id,data){

return repo.update(id,data);

}


module.exports={
getRide,
updateRide,'''
    )
    with open(SERVICE, 'w', encoding='utf-8') as f:
        f.write(service_src)
    print(f"FIX: added getRide()/updateRide() to {SERVICE}")
else:
    print(f"SKIP: {SERVICE} already has getRide()")

# ---------------------------------------------------------
# 3. Add real routes to server.js (right after the POST /api/rides block)
# ---------------------------------------------------------
SERVER = 'backend/server.js'
with open(SERVER, 'r', encoding='utf-8') as f:
    server_src = f.read()

if "app.get('/api/rides/:id'" not in server_src and 'app.get("/api/rides/:id"' not in server_src:
    marker = "app.post('/api/rides', function(req, res) {"
    idx = server_src.find(marker)
    if idx == -1:
        print("ABORT: could not find POST /api/rides marker in server.js — no changes made.")
    else:
        # find the end of that route's closing "});" to insert after it
        insert_point = server_src.find('\n});', idx) + len('\n});')
        new_routes = '''

// --- Added by BLOCK 3: real ride lookup + accept/complete via rideService ---
app.get('/api/rides/:id', function(req, res) {
  const ride = rideService.getRide(req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  res.json({ ride });
});

app.patch('/api/rides/:id', function(req, res) {
  const id = req.params.id;
  const { status, driverId } = req.body || {};
  let ride;
  if (status === 'accepted' || status === 'ACCEPTED') {
    ride = rideService.acceptRide(id, driverId || null);
  } else if (status === 'completed' || status === 'COMPLETED') {
    ride = rideService.completeRide(id);
  } else {
    ride = rideService.updateRide(id, req.body || {});
  }
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  console.log('Ride ' + ride.id + ' -> ' + ride.status);
  res.json({ ride });
});
'''
        server_src = server_src[:insert_point] + new_routes + server_src[insert_point:]
        with open(SERVER, 'w', encoding='utf-8') as f:
            f.write(server_src)
        print(f"FIX: added GET/PATCH /api/rides/:id to {SERVER}")
else:
    print(f"SKIP: {SERVER} already has GET /api/rides/:id")

# ---------------------------------------------------------
# 4. Archive the dead ride_api_patch.js
# ---------------------------------------------------------
DEAD = 'backend/ride_api_patch.js'
if os.path.isfile(DEAD):
    os.makedirs('archive/dead_backend_files', exist_ok=True)
    shutil.move(DEAD, 'archive/dead_backend_files/ride_api_patch.js')
    print(f"ARCHIVED: {DEAD} -> archive/dead_backend_files/ (was never required by server.js)")
else:
    print(f"SKIP: {DEAD} not found (already moved?)")

# ---------------------------------------------------------
# 5. Syntax check everything we touched
# ---------------------------------------------------------
print("\nSYNTAX CHECK:")
ok = True
for f in [REPO, SERVICE, SERVER]:
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  OK: {f}")
    else:
        print(f"  ERROR: {f} -> {(r.stdout+r.stderr).strip()[:300]}")
        ok = False

if not ok:
    print("\nSYNTAX ERRORS — stopping before restart/test. Paste this output to Claude.")
    exit(1)

# ---------------------------------------------------------
# 6. Restart backend and run the full lifecycle test
# ---------------------------------------------------------
print("\n--- Restarting backend ---")
subprocess.run(['pkill', '-f', 'node backend/server.js'])
time.sleep(1)
subprocess.Popen(['node', 'backend/server.js'], stdout=open('backend.log','w'), stderr=subprocess.STDOUT)
time.sleep(2)

import json, urllib.request

def call(method, path, body=None):
    url = f'http://localhost:3000{path}'
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return None, str(e)

print("\n--- LIVE LIFECYCLE TEST ---")
s, book = call('POST', '/api/rides', {'pickup':'BSTM HQ','dropoff':'Game City','fare':20,'type':'standard'})
print(f"1. Book -> {s} {book}")
ride_id = book.get('ride',{}).get('id') if isinstance(book, dict) else None

s, fetch1 = call('GET', f'/api/rides/{ride_id}')
print(f"2. Fetch -> {s} {fetch1}")

s, accept = call('PATCH', f'/api/rides/{ride_id}', {'status':'accepted','driverId':'TEST-DRIVER-1'})
print(f"3. Accept -> {s} {accept}")

s, fetch2 = call('GET', f'/api/rides/{ride_id}')
print(f"4. Confirm accepted -> {s} {fetch2}")

s, complete = call('PATCH', f'/api/rides/{ride_id}', {'status':'completed'})
print(f"5. Complete -> {s} {complete}")

s, fetch3 = call('GET', f'/api/rides/{ride_id}')
print(f"6. Confirm completed -> {s} {fetch3}")

print("\n" + "="*65)
final_status = fetch3.get('ride',{}).get('status') if isinstance(fetch3, dict) else None
if final_status == 'COMPLETED':
    print("BLOCK 3 SUCCESS — full ride lifecycle proven working end to end.")
else:
    print(f"INCOMPLETE — final status was '{final_status}', expected 'COMPLETED'. Paste this output to Claude.")
print("="*65)
