#!/data/data/com.termux/files/usr/bin/bash
# Moves old/dead files out of the repo into ~/CabLink-legacy (nothing is lost).
set -e
cd ~/CabLink-pwa
L=~/CabLink-legacy; mkdir -p "$L"
for p in archive frontend js admin config deployment vercel.json.tmp audit_report.md SESSION_CHANGELOG.md; do
  [ -e "$p" ] && mv "$p" "$L/" || true
done
find backend -type f \( -name "*.backup*" -o -name "*before*" -o -name "*pre_o6*" -o -name "*.bak" -o -name "*.old" \) -exec sh -c 'mkdir -p "$0/$(dirname "$1")" && mv "$1" "$0/$1"' "$L" {} \;
git rm -r --cached --ignore-unmatch -q backend/data 2>/dev/null || true
echo "Cleanup done. Old files are in $L"
