import subprocess, os, time, json, urllib.request, urllib.error

print("CABLINK BLOCK 4 — ADD MISSING PATCH ROUTE ONLY")
print("="*65)

SERVER = 'backend/server.js'
with open(SERVER, 'r', encoding='utf-8') as f:
    server_src = f.read()

has_get = "app.get('/api/rides/:id'" in server_src or 'app.get("/api/rides/:id"' in server_src
has_patch = "app.patch('/api/rides/:id'" in server_src or 'app.patch("/api/rides/:id"' in server_src

print(f"Existing GET /api/rides/:id  -> {has_get}")
print(f"Existing PATCH /api/rides/:id -> {has_patch}")

if has_patch:
    print("SKIP: PATCH route already present somewhere. Paste `grep -n \"api/rides/:id\" backend/server.js` to Claude to inspect it.")
else:
    marker = "app.post('/api/rides', function(req, res) {"
    idx = server_src.find(marker)
    if idx == -1:
        print("ABORT: could not find POST /api/rides marker.")
    else:
        insert_point = server_src.find('\n});', idx) + len('\n});')
        new_route = '''

// --- Added by BLOCK 4: real accept/complete via rideService ---
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
        server_src = server_src[:insert_point] + new_route + server_src[insert_point:]
        with open(SERVER, 'w', encoding='utf-8') as f:
            f.write(server_src)
        print(f"FIX: added PATCH /api/rides/:id to {SERVER}")

# syntax check
r = subprocess.run(['node', '--check', SERVER], capture_output=True, text=True)
if r.returncode != 0:
    print(f"SYNTAX ERROR in {SERVER}: {(r.stdout+r.stderr).strip()[:300]}")
    exit(1)
print(f"SYNTAX OK: {SERVER}")

# restart + retest
print("\n--- Restarting backend ---")
subprocess.run(['pkill', '-f', 'node backend/server.js'])
time.sleep(1)
subprocess.Popen(['node', 'backend/server.js'], stdout=open('backend.log', 'w'), stderr=subprocess.STDOUT)
time.sleep(2)

def call(method, path, body=None):
    url = f'http://localhost:3000{path}'
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'Content-Type': 'application/json'})
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
ride_id = book.get('ride', {}).get('id') if isinstance(book, dict) else None

s, accept = call('PATCH', f'/api/rides/{ride_id}', {'status':'accepted','driverId':'TEST-DRIVER-1'})
print(f"2. Accept -> {s} {accept}")

s, complete = call('PATCH', f'/api/rides/{ride_id}', {'status':'completed'})
print(f"3. Complete -> {s} {complete}")

s, fetch = call('GET', f'/api/rides/{ride_id}')
print(f"4. Confirm -> {s} {fetch}")

print("\n" + "="*65)
final_status = fetch.get('ride', {}).get('status') if isinstance(fetch, dict) else None
if final_status == 'COMPLETED':
    print("BLOCK 4 SUCCESS — full ride lifecycle proven working end to end.")
else:
    print(f"STILL BROKEN — final status '{final_status}'. Paste this output to Claude.")
print("="*65)
