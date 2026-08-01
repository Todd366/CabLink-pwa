#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK UI BRIDGE INJECTION"
echo "============================================================"

python3 <<'PY'
from pathlib import Path

p = Path("index.html")

text = p.read_text(errors="ignore")

script = '<script src="frontend/js/ui/ui_bridge.js"></script>'

if script in text:
    print("UI BRIDGE ALREADY LOADED")

else:

    marker = "</body>"

    if marker not in text:
        raise Exception("Cannot find </body>")

    text = text.replace(
        marker,
        "    " + script + "\n" + marker
    )

    p.write_text(text)

    print("UI BRIDGE INJECTED")

PY


echo
echo "=== VERIFY SCRIPT LOAD ==="

grep -n "ui_bridge.js" index.html


echo
echo "=== JAVASCRIPT SYNTAX ==="

node --check frontend/js/ui/ui_bridge.js

echo "ui_bridge.js OK"


echo
echo "============================================================"
echo "INJECTION COMPLETE"
echo "============================================================"

