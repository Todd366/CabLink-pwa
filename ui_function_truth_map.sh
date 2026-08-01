#!/data/data/com.termux/files/usr/bin/bash

echo "============================================================"
echo "CABLINK UI FUNCTION TRUTH MAP"
echo "============================================================"

python3 <<'PY'
import re
from pathlib import Path

html = Path("index.html").read_text(errors="ignore")

onclick=set(
    re.findall(r'onclick="(\w+)\(',html)
)

print("\n=== HTML FUNCTIONS ===")
print("COUNT:",len(onclick))

files=list(Path(".").rglob("*.js"))

for fn in sorted(onclick):

    found=[]

    pattern1=f"function {fn}"
    pattern2=f"window.{fn}"
    pattern3=f"const {fn}"
    pattern4=f"let {fn}"
    pattern5=f"var {fn}"

    for f in files:

        try:
            text=f.read_text(errors="ignore")

            if any(x in text for x in [
                pattern1,
                pattern2,
                pattern3,
                pattern4,
                pattern5
            ]):
                found.append(str(f))

        except:
            pass


    if found:
        print("\n✅",fn)
        for f in found[:5]:
            print("   ",f)
    else:
        print("\n❌",fn,"NOT FOUND")


print("\n============================================================")
print("TRUTH MAP COMPLETE")
print("============================================================")

PY
