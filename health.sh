#!/data/data/com.termux/files/usr/bin/bash

echo "=== CABLINK HEALTH CHECK ==="

echo ""
echo "Files:"
for f in index.html fix.js role.js fare_engine.js; do
 [ -f "$f" ] && echo "✓ $f" || echo "✗ $f missing"
done

echo ""
echo "JS Syntax:"
for f in fix.js role.js fare_engine.js; do
 node --check $f && echo "✓ $f"
done

echo ""
echo "Git:"
git log -1 --oneline

echo ""
echo "=== COMPLETE ==="
