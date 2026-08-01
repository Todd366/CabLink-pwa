#!/data/data/com.termux/files/usr/bin/bash

echo "=================================================="
echo "CABLINK RUNTIME SOURCE OF TRUTH"
echo "=================================================="

echo
echo "PACKAGE.JSON"
echo "--------------------------------------------------"
cat package.json

echo
echo "VITE CONFIG"
echo "--------------------------------------------------"
cat vite.config.js 2>/dev/null

echo
echo "VERCEL"
echo "--------------------------------------------------"
cat vercel.json 2>/dev/null

echo
echo "MANIFEST"
echo "--------------------------------------------------"
cat manifest.json 2>/dev/null

echo
echo "ENTRY HTML"
echo "--------------------------------------------------"
grep -n "main" index.html
grep -n "script" index.html

echo
echo "MAIN ENTRY"
echo "--------------------------------------------------"
sed -n '1,200p' frontend/main.jsx

echo
echo "APP ENTRY"
echo "--------------------------------------------------"
sed -n '1,200p' frontend/App.jsx

echo
echo "SERVER ENTRY"
echo "--------------------------------------------------"
sed -n '1,200p' backend/server.js

echo
echo "=================================================="
