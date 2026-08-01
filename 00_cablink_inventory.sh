#!/data/data/com.termux/files/usr/bin/bash

set +e

echo "============================================================"
echo "CABLINK — FORENSIC SYSTEM INVENTORY"
echo "============================================================"
echo "DATE: $(date)"
echo "PWD: $(pwd)"
echo "NODE: $(node --version 2>/dev/null)"
echo "NPM:  $(npm --version 2>/dev/null)"
echo "GIT:  $(git rev-parse --show-toplevel 2>/dev/null)"
echo

echo "============================================================"
echo "1. ROOT DIRECTORY"
echo "============================================================"
find . -maxdepth 1 -mindepth 1 -printf '%y %p\n' 2>/dev/null | sort

echo
echo "============================================================"
echo "2. COMPLETE FILE COUNT"
echo "============================================================"
find . -type f \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | wc -l

echo
echo "============================================================"
echo "3. FILES BY EXTENSION"
echo "============================================================"
find . -type f \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | awk -F. 'NF>1 {print tolower($NF)}' \
  | sort | uniq -c | sort -nr

echo
echo "============================================================"
echo "4. ALL JAVASCRIPT FILES"
echo "============================================================"
find . -type f -name '*.js' \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | sort

echo
echo "============================================================"
echo "5. ALL HTML FILES"
echo "============================================================"
find . -type f -name '*.html' \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | sort

echo
echo "============================================================"
echo "6. ALL JSON FILES"
echo "============================================================"
find . -type f -name '*.json' \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | sort

echo
echo "============================================================"
echo "7. ALL SHELL / PYTHON / CONFIG FILES"
echo "============================================================"
find . -type f \( \
  -name '*.sh' -o \
  -name '*.py' -o \
  -name '*.env*' -o \
  -name '*.yml' -o \
  -name '*.yaml' -o \
  -name '*.toml' \
\) \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | sort

echo
echo "============================================================"
echo "8. BACKUP / OLD / PREVIOUS VERSION FILES"
echo "============================================================"
find . -type f \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | grep -Ei \
'backup|bak|old|broken|before|pre_|stage|working|test|disabled|deprecated|legacy|copy|\.o[0-9]+|\.orig|\.save' \
  | sort

echo
echo "============================================================"
echo "9. LARGE DIRECTORIES"
echo "============================================================"
du -h -d 2 . 2>/dev/null | sort -h | tail -40

echo
echo "============================================================"
echo "10. GIT STATUS"
echo "============================================================"
git status --short 2>/dev/null

echo
echo "============================================================"
echo "11. GIT BRANCH"
echo "============================================================"
git branch --show-current 2>/dev/null

echo
echo "============================================================"
echo "12. GIT RECENT COMMITS"
echo "============================================================"
git log --oneline --decorate -20 2>/dev/null

echo
echo "============================================================"
echo "END INVENTORY"
echo "============================================================"
