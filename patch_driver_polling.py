import re, subprocess, sys, os

print("CABLINK BLOCK — RESTORE DRIVER POLLING + FIX driverId ATTRIBUTION")
print("="*68)

TARGET = 'frontend/index.html'

with open(TARGET, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

original_len = len(html.split('\n'))
print(f"Input: {original_len} lines")

# ════════════════════════════════════════════════════════════
# PRE-FLIGHT: confirm the exact bug is present before touching anything
# ════════════════════════════════════════════════════════════
required_markers = [
    r'CABLINK_DRIVER_REALITY_PATCH',
    r'window\.toggleDriverMode\s*=\s*async\s*function',
    r'localStorage\.setItem\(\s*["\']cablink_driver_id["\']\s*,\s*driver\.id\s*\)',
    r'toast\(\s*["\']Driver is LIVE on network["\']',
    r'toast\(\s*["\']Driver offline["\']',
]
missing = [m for m in required_markers if not re.search(m, html)]
if missing:
    print("\nPRE-FLIGHT FAILED — expected markers not found, file may have changed:")
    for m in missing:
        print(f"  MISSING: {m}")
    print("\nNot touching the file. Stopping.")
    sys.exit(1)
print("PRE-FLIGHT: all expected markers found")

# Sanity: make sure we're not double-patching an already-fixed file
if re.search(r'STATE\.driverId\s*=\s*driver\.id', html):
    print("\nSTATE.driverId assignment already present — this file may already be patched.")
    print("Not touching the file. Stopping.")
    sys.exit(1)

# ════════════════════════════════════════════════════════════
# FIX 1: set STATE.driverId right after the driver_id localStorage write,
# so acceptRealRequest()/completeRealRide() send a real driver id instead
# of undefined.
# ════════════════════════════════════════════════════════════
pattern1 = re.compile(
    r'(localStorage\.setItem\(\s*["\']cablink_driver_id["\']\s*,\s*driver\.id\s*\)\s*;)',
    re.DOTALL
)
new_html, n1 = pattern1.subn(r'\1\n\nSTATE.driverId = driver.id;', html, count=1)
if n1 != 1:
    print(f"FIX 1 FAILED — expected 1 match, got {n1}. Stopping without saving.")
    sys.exit(1)
html = new_html
print("FIX 1: STATE.driverId = driver.id inserted after localStorage write")

# ════════════════════════════════════════════════════════════
# FIX 2: restore pollForRideRequests() after successfully going online,
# right after the "Driver is LIVE on network" success toast.
# ════════════════════════════════════════════════════════════
pattern2 = re.compile(
    r'(toast\(\s*["\']Driver is LIVE on network["\']\s*,\s*["\']success["\']\s*\)\s*;)',
    re.DOTALL
)
new_html, n2 = pattern2.subn(r'\1\n\npollForRideRequests();', html, count=1)
if n2 != 1:
    print(f"FIX 2 FAILED — expected 1 match, got {n2}. Stopping without saving.")
    sys.exit(1)
html = new_html
print("FIX 2: pollForRideRequests() restored on go-online success path")

# ════════════════════════════════════════════════════════════
# FIX 3: clear the polling interval on go-offline, right before/around
# the "Driver offline" toast.
# ════════════════════════════════════════════════════════════
pattern3 = re.compile(
    r'(toast\(\s*["\']Driver offline["\']\s*,\s*["\']warning["\']\s*\)\s*;)',
    re.DOTALL
)
new_html, n3 = pattern3.subn(r'clearInterval(_driverRequestPoller);\n\n\1', html, count=1)
if n3 != 1:
    print(f"FIX 3 FAILED — expected 1 match, got {n3}. Stopping without saving.")
    sys.exit(1)
html = new_html
print("FIX 3: clearInterval(_driverRequestPoller) restored on go-offline path")

# ════════════════════════════════════════════════════════════
# SAVE
# ════════════════════════════════════════════════════════════
with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(html)

new_len = len(html.split('\n'))
print(f"\nResult: {new_len} lines (was {original_len})")

# ════════════════════════════════════════════════════════════
# VERIFY
# ════════════════════════════════════════════════════════════
print("\nVERIFICATION:")
checks = {
    'STATE.driverId set':          r'STATE\.driverId\s*=\s*driver\.id',
    'pollForRideRequests() called on go-online': r'toast\(\s*["\']Driver is LIVE on network["\'][\s\S]{0,80}pollForRideRequests\(\)',
    'clearInterval on go-offline':  r'clearInterval\(_driverRequestPoller\)[\s\S]{0,80}toast\(\s*["\']Driver offline["\']',
}
all_clean = True
for name, pat in checks.items():
    if re.search(pat, html):
        print(f"  OK: {name}")
    else:
        print(f"  MISSING: {name}")
        all_clean = False

# ════════════════════════════════════════════════════════════
# SYNTAX CHECK — extract just the patched <script> block and run
# node --check against it, since node can't parse the whole .html file.
# ════════════════════════════════════════════════════════════
print("\nSYNTAX CHECK (patched <script> block only):")
all_syntax_ok = True
m = re.search(r'CABLINK_DRIVER_REALITY_PATCH[\s\S]*?</script>', html)
if not m:
    print("  ERROR: could not re-locate the patched block for syntax check")
    all_syntax_ok = False
else:
    block_js = m.group(0).rsplit('</script>', 1)[0]
    tmp_path = '/tmp/_cablink_patch_check.js'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(block_js)
    r = subprocess.run(['node', '--check', tmp_path], capture_output=True, text=True)
    if r.returncode == 0:
        print("  OK: patched block is syntactically valid JS")
    else:
        print(f"  ERROR: {(r.stdout + r.stderr).strip()[:300]}")
        all_syntax_ok = False
    os.remove(tmp_path)

if not all_syntax_ok or not all_clean:
    print("\nISSUES FOUND. File on disk WAS modified — review with `git diff` before committing.")
    print("If it looks wrong, revert with: git checkout -- frontend/index.html")
    sys.exit(1)

print("\n" + "="*68)
print("DONE — all three fixes applied and verified.")
print("Nothing was committed. Review before committing:")
print("  git diff frontend/index.html")
print("="*68)
