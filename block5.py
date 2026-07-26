import subprocess, time, json, urllib.request, urllib.error

print("CABLINK BLOCK 5 — REMOVE BROKEN GENERIC PATCH, USE REAL /accept /complete ROUTES")
print("="*65)

SERVER = 'backend/server.js'
with open(SERVER, 'r', encoding='utf-8') as f:
    src = f.read()

BROKEN = """app.patch('/api/rides/:id', function(req, res) {
  var ride = rides.find(function(r){ return r.id === req.params.id; });
  if (!ride) return res.status(404).json({ error:'Ride not found' });
  Object.assign(ride, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success:true, ride:ride });
});"""

if BROKEN in src:
    src = src.replace(BROKEN, "// removed: broken generic PATCH that used stale local `rides` array")
    with open(SERVER, 'w', encoding='utf-8') as f:
        f.write(src)
    print("FIX: removed broken generic PATCH /api/rides/:id handler")
else:
    print("WARNING: exact broken block not found (whitespace mismatch?) — no changes made.")
    print("Paste `sed -n \"50,61p\" backend/server.js` to Claude to check manually.")
    exit(1)

r = subprocess.run(['node', '--check', SERVER], capture_output=True, text=True)
if r.returncode != 0:
    print(f"SYNTAX ERROR: {(r.stdout+r.stderr).strip()[:300]}")
    exit(1)
print("SYNTAX OK")

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

print("\n--- LIVE LIFECYCLE TEST (using real /accept and /complete routes) ---")
s, book = call('POST', '/api/rides', {'pickup':'BSTM HQ','dropoff':'Game City','fare':20,'type':'standard'})
print(f"1. Book -> {s} {book}")
ride_id = book.get('ride', {}).get('id') if isinstance(book, dict) else None

s, accept = call('PATCH', f'/api/rides/{ride_id}/accept', {'driverId':'TEST-DRIVER-1'})
print(f"2. Accept -> {s} {accept}")

s, complete = call('PATCH', f'/api/rides/{ride_id}/complete', {})
print(f"3. Complete -> {s} {complete}")

s, fetch = call('GET', f'/api/rides/{ride_id}')
print(f"4. Confirm -> {s} {fetch}")

print("\n" + "="*65)
final_status = fetch.get('ride', {}).get('status') if isinstance(fetch, dict) else None
if final_status == 'COMPLETED':
    print("BLOCK 5 SUCCESS — full real ride lifecycle proven working end to end:")
    print("  book -> accept -> complete -> confirmed, via real file-backed storage.")
else:
    print(f"STILL BROKEN — final status '{final_status}'. Paste this output to Claude.")
print("="*65)
