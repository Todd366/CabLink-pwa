#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK REMAINING UI RUNTIME EXTRACTION"
echo "============================================================"

python3 <<'PY'
from pathlib import Path
import re

source = Path("frontend/index.html").read_text(errors="ignore")

targets = [
"openModal",
"closeModal",
"haptic",
"detectLocation",
"toggleChat",
"closeThankyou",
"voiceInput",
"copyRideId",
"copyShareLink",
"submitFeedback"
]

output = Path("frontend/js/ui/ui_runtime_extra.js")

result = """
/*
============================================================
CABLINK UI RUNTIME EXTRA
Recovered missing UI handlers
============================================================
*/
"""

for fn in targets:

    pattern = r"((?:async\s+)?function\s+"+fn+r"\s*\([^)]*\)\s*\{)"

    m = re.search(pattern, source)

    if not m:
        print("MISSING:", fn)
        continue

    start=m.start()
    brace=source.find("{",start)

    depth=0
    end=None

    for i in range(brace,len(source)):

        if source[i]=="{":
            depth+=1

        elif source[i]=="}":
            depth-=1

        if depth==0:
            end=i+1
            break

    result += "\n\n"+source[start:end]+"\n"

    print("EXTRACTED:",fn)


output.write_text(result)

PY


echo
echo "=== CHECK ==="

node --check frontend/js/ui/ui_runtime_extra.js

wc -l frontend/js/ui/ui_runtime_extra.js

echo
echo "============================================================"
echo "DONE"
echo "============================================================"

