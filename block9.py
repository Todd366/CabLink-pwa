import re

print("CABLINK BLOCK 9 — FIX ACCEPT RACE CONDITION + REAL APPROVAL FLOW")
print("="*70)

# ─────────────────────────────────────────────────────────────
# 1. Fix acceptRide() to reject a ride that's already been accepted
# ─────────────────────────────────────────────────────────────
SERVICE = 'backend/services/rideService.js'
with open(SERVICE, 'r', encoding='utf-8') as f:
    service_src = f.read()

OLD_ACCEPT = """function acceptRide(id,driverId){

return repo.update(
id,
{
status:"ACCEPTED",
driverId
}
);

}"""

NEW_ACCEPT = """function acceptRide(id,driverId){

const existing = repo.get(id);

if(!existing){
return null;
}

if(existing.status !== "SEARCHING"){
const err = new Error("Ride already " + existing.status.toLowerCase() + " by another driver");
err.code = "RIDE_ALREADY_TAKEN";
throw err;
}

return repo.update(
id,
{
status:"ACCEPTED",
driverId
}
);

}"""

if OLD_ACCEPT in service_src:
    service_src = service_src.replace(OLD_ACCEPT, NEW_ACCEPT, 1)
    with open(SERVICE, 'w', encoding='utf-8') as f:
        f.write(service_src)
    print("FIX 1: acceptRide() now rejects double-accepts (checks status === SEARCHING first)")
else:
    print("WARNING: exact acceptRide() block not found — skipped. Check manually.")

# ─────────────────────────────────────────────────────────────
# 2. Update the /accept route in server.js to handle the new error
# ─────────────────────────────────────────────────────────────
SERVER = 'backend/server.js'
with open(SERVER, 'r', encoding='utf-8') as f:
    server_src = f.read()

OLD_ROUTE = """app.patch('/api/rides/:id/accept', function(req,res){

const ride = rideService.acceptRide(
req.params.id,
req.body.driverId
);

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});"""

NEW_ROUTE = """app.patch('/api/rides/:id/accept', function(req,res){

let ride;
try{
ride = rideService.acceptRide(
req.params.id,
req.body.driverId
);
}catch(e){
if(e.code === "RIDE_ALREADY_TAKEN"){
return res.status(409).json({
error: e.message
});
}
return res.status(500).json({ error: "Internal error accepting ride" });
}

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});"""

if OLD_ROUTE in server_src:
    server_src = server_src.replace(OLD_ROUTE, NEW_ROUTE, 1)
    changed_route = True
else:
    changed_route = False
    print("WARNING: exact /accept route not found in server.js — skipped. Check manually.")

# ─────────────────────────────────────────────────────────────
# 3. Add real approve/reject endpoints for driver applications
# ─────────────────────────────────────────────────────────────
if "app.post('/api/drivers/apply'" in server_src and "app.post('/api/drivers/apply/:id/approve'" not in server_src:
    marker = "app.post('/api/drivers/apply', function(req, res) {"
    idx = server_src.find(marker)
    insert_point = server_src.find('\n});', idx) + len('\n});')
    NEW_ENDPOINTS = '''

// --- Real driver application review (added Block 9) ---
app.get('/api/drivers/apply', function(req, res) {
  res.json({ applications: driverApps });
});

app.post('/api/drivers/apply/:id/approve', function(req, res) {
  var app_ = driverApps.find(function(a){ return a.id === req.params.id; });
  if (!app_) return res.status(404).json({ error: 'Application not found' });
  app_.status = 'approved';
  app_.approvedAt = new Date().toISOString();
  console.log('Driver application approved:', app_.id, app_.name);
  res.json({ success: true, application: app_ });
});

app.post('/api/drivers/apply/:id/reject', function(req, res) {
  var app_ = driverApps.find(function(a){ return a.id === req.params.id; });
  if (!app_) return res.status(404).json({ error: 'Application not found' });
  app_.status = 'rejected';
  app_.rejectedAt = new Date().toISOString();
  console.log('Driver application rejected:', app_.id, app_.name);
  res.json({ success: true, application: app_ });
});

app.get('/api/drivers/apply/:id/status', function(req, res) {
  var app_ = driverApps.find(function(a){ return a.id === req.params.id; });
  if (!app_) return res.status(404).json({ error: 'Application not found' });
  res.json({ status: app_.status });
});
'''
    server_src = server_src[:insert_point] + NEW_ENDPOINTS + server_src[insert_point:]
    changed_approval = True
else:
    changed_approval = False
    print("SKIP: approval endpoints already present or apply route not found")

with open(SERVER, 'w', encoding='utf-8') as f:
    f.write(server_src)

if changed_route:
    print("FIX 2: /accept route now returns 409 Conflict if ride was already taken")
if changed_approval:
    print("FIX 3: added GET /api/drivers/apply (list), POST .../approve, .../reject, GET .../status")

# ─────────────────────────────────────────────────────────────
# SYNTAX CHECK
# ─────────────────────────────────────────────────────────────
import subprocess
print("\nSYNTAX CHECK:")
ok = True
for f in [SERVICE, SERVER]:
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  OK: {f}")
    else:
        print(f"  ERROR: {f} -> {(r.stdout+r.stderr).strip()[:300]}")
        ok = False

print("\n" + "="*70)
if ok:
    print("BLOCK 9 COMPLETE — restart backend and re-run the race test to confirm the fix.")
else:
    print("SYNTAX ERRORS — do not restart backend until fixed. Paste this output to Claude.")
print("="*70)
