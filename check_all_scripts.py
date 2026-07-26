import re

with open('frontend/index.html', encoding='utf-8') as f:
    html = f.read()

# Find all <script>...</script> blocks (not src=, not type=module — those need different handling)
pattern = re.compile(r'<script(?![^>]*\bsrc=)(?![^>]*type=["\']module["\'])[^>]*>([\s\S]*?)</script>', re.IGNORECASE)
matches = list(pattern.finditer(html))

print(f"Found {len(matches)} classic inline <script> blocks (non-module, non-src)")
print("="*70)

import subprocess, os

for i, m in enumerate(matches):
    code = m.group(1).strip()
    if not code:
        continue
    line_no = html[:m.start()].count('\n') + 1
    fname = f'.check_script_{i}.js'
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(code)
    r = subprocess.run(['node', '--check', fname], capture_output=True, text=True)
    status = "OK" if r.returncode == 0 else "SYNTAX ERROR"
    print(f"Block {i} (starts around line {line_no}, {len(code)} chars): {status}")
    if r.returncode != 0:
        print(f"    {(r.stdout+r.stderr).strip()}")
    os.remove(fname)

print("="*70)
print("Also checking module script separately (imports won't check via plain node):")
module_pattern = re.compile(r'<script type=["\']module["\'][^>]*>([\s\S]*?)</script>', re.IGNORECASE)
mod_matches = list(module_pattern.finditer(html))
for i, m in enumerate(mod_matches):
    line_no = html[:m.start()].count('\n') + 1
    code = m.group(1).strip()
    print(f"Module block {i} at line {line_no}: {len(code)} chars")
    # strip import lines to check the rest of the syntax
    stripped = re.sub(r'^import\s+.*?;?\s*$', '', code, flags=re.MULTILINE)
    fname = f'.check_module_{i}.js'
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(stripped)
    r = subprocess.run(['node', '--check', fname], capture_output=True, text=True)
    status = "OK (excluding import line)" if r.returncode == 0 else "SYNTAX ERROR"
    print(f"    {status}")
    if r.returncode != 0:
        print(f"    {(r.stdout+r.stderr).strip()}")
    os.remove(fname)
