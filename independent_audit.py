import re, os, subprocess

print("CABLINK INDEPENDENT RUNTIME AUDIT — read-only, traces from confirmed entrypoint only")
print("="*75)

# Step 1: confirm the real entrypoint chain, don't assume it
print("\n[1] package.json entrypoint fields:")
with open('package.json') as f:
    pkg = f.read()
for line in pkg.split('\n'):
    if '"main"' in line or '"start"' in line or '"backend"' in line:
        print(" ", line.strip())

print("\n[2] backend/server.js contents (confirm what it requires):")
with open('backend/server.js') as f:
    print(f.read())

print("\n[3] backend/server/app.js — full contents (the real mount point):")
with open('backend/server/app.js') as f:
    app_src = f.read()
print(app_src)

# Step 2: extract every app.use(...) call with its path and target module
print("\n[4] Every app.use() mount, in registration order (this IS Express's real match order):")
mounts = re.findall(r'app\.use\(\s*(["\'][^"\']*["\'])?\s*,?\s*(\w+)\s*\)', app_src)
requires = dict(re.findall(r'const\s+(\w+)\s*=\s*require\(["\']([^"\']+)["\']\)', app_src))
for path, varname in mounts:
    resolved = requires.get(varname, '???')
    path_display = path if path else '(no prefix — root mount)'
    print(f"  app.use({path_display}, {varname})  ->  requires '{resolved}'")

# Step 3: for each mounted route file, extract every sub-route it defines
print("\n[5] Every actual route handler inside each mounted file:")
mounted_files = set(requires.values())
for req_path in mounted_files:
    # resolve relative path from backend/server/
    resolved_path = os.path.normpath(os.path.join('backend/server', req_path)) + '.js'
    if not os.path.isfile(resolved_path):
        resolved_path = os.path.normpath(os.path.join('backend/server', req_path + '.js'))
    if not os.path.isfile(resolved_path):
        print(f"  COULD NOT RESOLVE: {req_path}")
        continue
    with open(resolved_path) as f:
        route_src = f.read()
    routes_found = re.findall(r'router\.(get|post|patch|put|delete)\(\s*["\']([^"\']*)["\']', route_src)
    print(f"\n  --- {resolved_path} ---")
    for method, subpath in routes_found:
        print(f"    {method.upper()} {subpath}")
    # what does THIS file require/depend on?
    inner_requires = re.findall(r'require\(["\']([^"\']+)["\']\)', route_src)
    print(f"    depends on: {inner_requires}")

# Step 4: build the FULL effective route table
print("\n[6] FULL EFFECTIVE ROUTE TABLE (mount prefix + subpath, in match order):")
for path, varname in mounts:
    resolved = requires.get(varname, None)
    if not resolved:
        continue
    resolved_path = os.path.normpath(os.path.join('backend/server', resolved)) + '.js'
    if not os.path.isfile(resolved_path):
        resolved_path = os.path.normpath(os.path.join('backend/server', resolved + '.js'))
    if not os.path.isfile(resolved_path):
        continue
    with open(resolved_path) as f:
        route_src = f.read()
    routes_found = re.findall(r'router\.(get|post|patch|put|delete)\(\s*["\']([^"\']*)["\']', route_src)
    prefix = path.strip('"\'') if path else ''
    for method, subpath in routes_found:
        full = (prefix.rstrip('/') + '/' + subpath.lstrip('/')).replace('//', '/')
        print(f"  {method.upper():6} {full:35} <- {resolved_path}")

# Step 5: check which repository/store each route file actually writes to
print("\n[7] Which data store does each ride-related route file actually touch?")
ride_related = [f for f in mounted_files if 'ride' in f.lower()]
for req_path in ride_related:
    resolved_path = os.path.normpath(os.path.join('backend/server', req_path)) + '.js'
    if not os.path.isfile(resolved_path):
        resolved_path = os.path.normpath(os.path.join('backend/server', req_path + '.js'))
    if not os.path.isfile(resolved_path):
        continue
    with open(resolved_path) as f:
        content = f.read()
    inner_requires = re.findall(r'require\(["\']([^"\']+)["\']\)', content)
    print(f"\n  {resolved_path} requires: {inner_requires}")
    for ir in inner_requires:
        if 'ride' in ir.lower() or 'service' in ir.lower():
            svc_path = os.path.normpath(os.path.join(os.path.dirname(resolved_path), ir)) + '.js'
            if os.path.isfile(svc_path):
                with open(svc_path) as sf:
                    svc_content = sf.read()
                stores = re.findall(r'["\']([^"\']*\.json)["\']', svc_content)
                deeper_requires = re.findall(r'require\(["\']([^"\']+)["\']\)', svc_content)
                print(f"    -> {svc_path}")
                print(f"       json files referenced: {stores}")
                print(f"       further requires: {deeper_requires}")

print("\n" + "="*75)
print("AUDIT COMPLETE — nothing modified. This traced ONLY from the confirmed")
print("real entrypoint (backend/server.js -> backend/server/app.js) outward,")
print("not from filenames or assumptions.")
print("="*75)
