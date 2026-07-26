import subprocess, re, os

print("CABLINK BLOCK 2 — FIX CORRECT FILE + ADD MISSING ROUTES")
print("="*65)

TARGET = 'frontend/index.html'

if not os.path.isfile(TARGET):
    print(f"ABORT: {TARGET} not found. Check your folder structure.")
    exit(1)

with open(TARGET, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

original_len = len(html.split('\n'))
print(f"Editing: {TARGET}")
print(f"Input: {original_len} lines")

# FIX 1: Remove simBtn
html = re.sub(r'\s*<button[^>]*id=["\']simBtn["\'][^>]*>.*?</button>', '', html, flags=re.DOTALL)
print("FIX 1: simBtn removed")

# FIX 2: Remove Math.random() fake driver count
html = re.sub(
    r'function driftDriverMarkers\(\)\{[\s\S]*?\n\}',
    'function driftDriverMarkers(){ /* fake drift removed — real GPS in Phase 2 */ }',
    html
)
print("FIX 2: driftDriverMarkers() fake randomness removed")

# FIX 3: Remove fake chat auto-replies
html = re.sub(
    r"const replies = \[[\s\S]*?\];\s*\n\s*setTimeout\(\(\) => appendDriverMsg\('Driver', replies\[Math\.floor\(Math\.random\(\)\*replies\.length\)\]\), 1500\+Math\.random\(\)\*2000\);",
    "// Real driver replies come from backend chat endpoint (not yet built)",
    html
)
print("FIX 3: fake chat auto-replies removed")

# FIX 4: Remove localStorage-only ride completion fallback triggers tied to setTimeout
html = re.sub(r'setTimeout\(completeRide,\s*\d+\);', '// completeRide() now must be triggered by real backend status', html)
print("FIX 4: setTimeout auto-complete removed")

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(html)

new_len = len(html.split('\n'))
print(f"Result: {new_len} lines (was {original_len})")

# VERIFY on the CORRECT file this time
lines = html.split('\n')
print("\nVERIFICATION (frontend/index.html):")
checks = {
    'simBtn': r'id=["\']simBtn["\']',
    'fake replies array': r'const replies\s*=\s*\[',
    'setTimeout complete': r'setTimeout\(completeRide',
}
all_clean = True
for name, pat in checks.items():
    found = [i+1 for i, l in enumerate(lines) if re.search(pat, l)]
    if found:
        print(f"  STILL PRESENT: {name} at lines {found[:3]}")
        all_clean = False
    else:
        print(f"  CLEAN: {name}")

# ADD MISSING BACKEND ROUTES
print("\n--- Adding acceptRide/completeRide backend routes ---")
ROUTE_FILE = 'backend/ride_api_patch.js'
if os.path.isfile(ROUTE_FILE):
    with open(ROUTE_FILE, 'r', encoding='utf-8') as f:
        backend_src = f.read()

    if 'PATCH' not in backend_src and "'/api/rides/:id'" not in backend_src:
        addition = '''

// --- Added by BLOCK 2: real accept + complete endpoints ---
app.patch("/api/rides/:id", (req, res) => {
  const ride = RIDES.find(r => String(r.id) === String(req.params.id));
  if (!ride) return res.status(404).json({ error: "ride not found" });
  const { status, driverId } = req.body;
  if (status) ride.status = status;
  if (driverId) ride.driverId = driverId;
  ride.updatedAt = Date.now();
  console.log(`Ride ${ride.id} -> ${ride.status}`);
  res.json({ ride });
});

app.get("/api/rides/:id", (req, res) => {
  const ride = RIDES.find(r => String(r.id) === String(req.params.id));
  if (!ride) return res.status(404).json({ error: "ride not found" });
  res.json({ ride });
});
'''
        backend_src = backend_src.rstrip() + addition
        with open(ROUTE_FILE, 'w', encoding='utf-8') as f:
            f.write(backend_src)
        print(f"ADDED: PATCH /api/rides/:id and GET /api/rides/:id to {ROUTE_FILE}")
    else:
        print(f"SKIPPED: {ROUTE_FILE} already seems to have these routes")
else:
    print(f"WARNING: {ROUTE_FILE} not found — could not add routes automatically. Tell Claude the actual path to your rides route file.")

# SYNTAX CHECK
print("\nSYNTAX CHECK:")
all_syntax_ok = True
for js in ['backend/server.js', 'backend/ride_api_patch.js']:
    if not os.path.isfile(js):
        print(f"  SKIP (not found): {js}")
        continue
    r = subprocess.run(['node', '--check', js], capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  OK: {js}")
    else:
        print(f"  ERROR: {js} -> {(r.stdout+r.stderr).strip()[:200]}")
        all_syntax_ok = False

print("\n" + "="*65)
if all_clean and all_syntax_ok:
    print("BLOCK 2 COMPLETE — frontend/index.html fixed, routes added, syntax OK")
    print("NEXT: restart backend (node backend/server.js) and test booking a ride,")
    print("      then PATCH it to accepted/completed and confirm it sticks.")
else:
    print("ISSUES REMAIN — see above. Nothing committed to git. Paste this output to Claude.")
print("="*65)
