#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK UI BRIDGE EXTRACTION"
echo "============================================================"

mkdir -p frontend/js/ui

python3 <<'PY'
from pathlib import Path
import re

source = Path("frontend/index.html").read_text(errors="ignore")

targets = [
    "connectWallet",
    "claimReward",
    "claimDaily",
    "sendChat",
    "openSOS",
    "showScreen"
]

output = """/*
============================================================
CABLINK UI BRIDGE
Extracted runtime functions
============================================================
*/

"""

for fn in targets:

    pattern = r"((?:async\s+)?function\s+" + fn + r"\s*\([^)]*\)\s*\{)"

    match = re.search(pattern, source)

    if not match:
        raise Exception(f"Missing {fn}")

    start = match.start()

    brace = source.find("{", start)

    depth = 0
    end = None

    for i in range(brace, len(source)):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1

        if depth == 0:
            end = i + 1
            break

    block = source[start:end]

    output += "\n\n" + block + "\n"

Path("frontend/js/ui/ui_bridge.js").write_text(output)

print("UI BRIDGE CREATED")
print("Functions:")
for x in targets:
    print(" -",x)

PY


echo
echo "=== VERIFY FILE ==="

wc -l frontend/js/ui/ui_bridge.js

echo
echo "=== FUNCTIONS ==="

grep -n "function\|async function" frontend/js/ui/ui_bridge.js


echo
echo "============================================================"
echo "EXTRACTION COMPLETE"
echo "============================================================"

