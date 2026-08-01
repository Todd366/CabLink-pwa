#!/data/data/com.termux/files/usr/bin/bash

set +e

ROOT="$(pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="cablink_forensic_evidence_$STAMP"

mkdir -p "$OUT"

echo "============================================================"
echo "CABLINK — FORENSIC DISCOVERY / NO MODIFICATIONS"
echo "============================================================"
echo "ROOT: $ROOT"
echo "TIME: $(date)"
echo "OUTPUT: $OUT"
echo

run() {
  NAME="$1"
  shift
  echo ">>> $NAME"
  "$@" > "$OUT/$NAME.txt" 2>&1
}

echo "============================================================"
echo "1. ROOT DIRECTORY"
echo "============================================================"

run 001_root_listing \
  find . -maxdepth 1 -mindepth 1 -printf '%y %p\n'

echo "============================================================"
echo "2. COMPLETE FILE INVENTORY"
echo "============================================================"

run 002_all_files \
  find . -type f \
    -not -path './node_modules/*' \
    -not -path './.git/*' \
    -not -path './cablink_forensic_evidence_*/*' \
    | sort

echo "============================================================"
echo "3. DIRECTORY INVENTORY"
echo "============================================================"

run 003_all_directories \
  find . -type d \
    -not -path './node_modules/*' \
    -not -path './.git/*' \
    | sort

echo "============================================================"
echo "4. FILE COUNTS BY EXTENSION"
echo "============================================================"

run 004_extension_counts \
  sh -c 'find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | sed "s/.*\.//" | sort | uniq -c | sort -nr'

echo "============================================================"
echo "5. ALL JAVASCRIPT / JSX / TS FILES"
echo "============================================================"

run 005_js_files \
  find . -type f \( \
    -name '*.js' -o \
    -name '*.jsx' -o \
    -name '*.mjs' -o \
    -name '*.cjs' -o \
    -name '*.ts' -o \
    -name '*.tsx' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | sort

echo "============================================================"
echo "6. ALL JSON / CONFIG FILES"
echo "============================================================"

run 006_config_files \
  find . -type f \( \
    -name '*.json' -o \
    -name '*.jsonc' -o \
    -name '*.yaml' -o \
    -name '*.yml' -o \
    -name '*.toml' \
    -o -name '.env*' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | sort

echo "============================================================"
echo "7. BACKUP / ARCHIVE / LEGACY FILES"
echo "============================================================"

run 007_backup_archive_files \
  find . -type f \( \
    -iname '*backup*' -o \
    -iname '*.bak' -o \
    -iname '*.old' -o \
    -iname '*.orig' -o \
    -iname '*legacy*' -o \
    -iname '*before*' -o \
    -iname '*pre_*' -o \
    -iname '*.stage*' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | sort

echo "============================================================"
echo "8. FILES WITH VERSION / PHASE / MIGRATION NAMES"
echo "============================================================"

run 008_versioned_files \
  find . -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | grep -Ei 'phase|stage|migration|o[0-9]+|v[0-9]+|step[0-9]+|restore|repair|canonical|legacy|working|final|old|backup|before|pre_' \
  | sort

echo "============================================================"
echo "9. PACKAGE.JSON"
echo "============================================================"

run 009_package_json \
  cat package.json

echo "============================================================"
echo "10. VERCEL CONFIG"
echo "============================================================"

run 010_vercel_json \
  cat vercel.json

echo "============================================================"
echo "11. VITE CONFIG FILES"
echo "============================================================"

run 011_vite_configs \
  sh -c 'find . -maxdepth 4 -type f \( -name "vite.config.*" -o -name "vite.*.config.*" \) -not -path "./node_modules/*" -print -exec sh -c "echo; echo ==== \$1 ====; cat \$1" _ {} \;'

echo "============================================================"
echo "12. INDEX / APP ENTRY CANDIDATES"
echo "============================================================"

run 012_entry_candidates \
  sh -c 'find . -type f \( \
    -name "index.html" -o \
    -name "App.jsx" -o \
    -name "App.js" -o \
    -name "main.jsx" -o \
    -name "main.js" -o \
    -name "app.js" -o \
    -name "server.js" -o \
    -name "index.js" \
  \) -not -path "./node_modules/*" -not -path "./.git/*" | sort'

echo "============================================================"
echo "13. SCRIPT TAGS"
echo "============================================================"

run 013_script_tags \
  grep -RInE '<script|type=["'\'']module|src=["'\'']' . \
  --include='*.html' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "14. IMPORT / REQUIRE GRAPH"
echo "============================================================"

run 014_import_require_graph \
  grep -RInE \
  '(^|[^A-Za-z])(import .* from|import\(|require\(|export .* from)' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --include='*.cjs' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "15. SERVER / API ENTRY REFERENCES"
echo "============================================================"

run 015_server_api_references \
  grep -RInE \
  'express|createServer|app\.listen|module\.exports|exports\.|api/|routes/|fetch\(|axios|firebase|firestore|vercel' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --include='*.cjs' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "16. RIDE-RELATED FILES"
echo "============================================================"

run 016_ride_related_files \
  find . -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | grep -Ei 'ride|hailing|booking|dispatch|completion|trip|journey' \
  | sort

echo "============================================================"
echo "17. RIDE REPOSITORY REFERENCES"
echo "============================================================"

run 017_ride_repository_references \
  grep -RInE \
  'rideRepository|ride_repository|RideRepository|rideStore|ride_store|ridesRepository|rides\.json|ride(s)?Repository' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.json' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "18. RIDE ENGINE REFERENCES"
echo "============================================================"

run 018_ride_engine_references \
  grep -RInE \
  'ride_engine|RideEngine|rideEngine|ride_state|rideState|rideStateMachine|ride_state_machine|canonical' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.json' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "19. DATA / STORAGE REFERENCES"
echo "============================================================"

run 019_storage_references \
  grep -RInE \
  'rides\.json|drivers\.json|users\.json|database|storage|Firestore|firestore|Firebase|localStorage|sessionStorage|JSON\.stringify|JSON\.parse' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.json' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "20. ROLE REFERENCES"
echo "============================================================"

run 020_role_references \
  grep -RInE \
  'role|driver|passenger|rider|userRole|driverId|passengerId|currentUser' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.html' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "21. REWARD / THB / BLOCKCHAIN REFERENCES"
echo "============================================================"

run 021_blockchain_reward_references \
  grep -RInE \
  'THB|THoBo|blockchain|wallet|reward|claim|transfer|ethers|BSC|chainId|97' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.json' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "22. GPS / LOCATION REFERENCES"
echo "============================================================"

run 022_gps_location_references \
  grep -RInE \
  'geolocation|navigator\.geolocation|latitude|longitude|lat|lng|gps|location|tracking' . \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.html' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=backups \
  --exclude-dir=archive \
  --exclude-dir=migration_backup \
  2>/dev/null

echo "============================================================"
echo "23. GIT STATUS"
echo "============================================================"

run 023_git_status \
  git status --short

echo "============================================================"
echo "24. GIT LOG"
echo "============================================================"

run 024_git_log \
  git log --oneline --decorate --all -100

echo "============================================================"
echo "25. GIT BRANCHES"
echo "============================================================"

run 025_git_branches \
  git branch -a -vv

echo "============================================================"
echo "26. GIT TAGS"
echo "============================================================"

run 026_git_tags \
  git tag --list

echo "============================================================"
echo "27. GIT ROOT-LEVEL TRACKED FILES"
echo "============================================================"

run 027_git_tracked_files \
  git ls-files

echo "============================================================"
echo "28. UNTRACKED FILES"
echo "============================================================"

run 028_git_untracked \
  git status --short | grep '^??' || true

echo "============================================================"
echo "29. MODIFIED FILES"
echo "============================================================"

run 029_git_modified \
  git status --short | grep '^ M\|^M ' || true

echo "============================================================"
echo "30. GIT DIFF STAT"
echo "============================================================"

run 030_git_diff_stat \
  git diff --stat

echo "============================================================"
echo "31. ACTIVE FILE HASHES"
echo "============================================================"

run 031_active_sha256 \
  find . -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -not -path './backups/*' \
  -not -path './archive/*' \
  -not -path './migration_backup/*' \
  -not -path './cablink_forensic_evidence_*/*' \
  -print0 | sort -z | xargs -0 sha256sum

echo "============================================================"
echo "32. DUPLICATE CONTENT HASHES"
echo "============================================================"

run 032_duplicate_hashes \
  sh -c 'find . -type f \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./cablink_forensic_evidence_*/*" \
  -print0 | xargs -0 sha256sum | sort | awk "{hash=\$1; \$1=\"\"; sub(/^ /,\"\"); files[hash]=files[hash] \"\\n  \" \$0; count[hash]++} END {for (h in count) if (count[h]>1) print \"HASH: \" h \" COUNT: \" count[h] files[h] \"\\n\"}"'

echo "============================================================"
echo "33. FILE SIZE MAP"
echo "============================================================"

run 033_file_sizes \
  find . -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -not -path './cablink_forensic_evidence_*/*' \
  -printf '%s %p\n' \
  | sort -nr

echo "============================================================"
echo "34. POSSIBLE DUPLICATE BASENAMES"
echo "============================================================"

run 034_duplicate_basenames \
  sh -c 'find . -type f \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./cablink_forensic_evidence_*/*" \
  | sed "s#.*/##" | sort | uniq -d'

echo "============================================================"
echo "35. ALL RUNTIME-LIKE ENTRY FILE CONTENT"
echo "============================================================"

{
  for f in \
    index.html \
    frontend/index.html \
    frontend/App.jsx \
    frontend/main.jsx \
    frontend/js/app.js \
    frontend/js/app_core.js \
    frontend/js/core.js \
    frontend/js/role.js \
    frontend/js/fix.js \
    App.jsx \
    main.jsx \
    api/index.js \
    backend/server/app.js \
    backend/routes/rides.js \
    backend/canonical/ride_engine.js \
    backend/canonical/ride_repository.js \
    backend/database/ride_repository.js \
    backend/rides/ride_engine.js \
    backend/rides/ride_state_engine.js \
    backend/services/rideService.js \
    backend/services/ride_service.js \
    backend/services/ride_orchestrator_service.js \
    backend/services/ride_completion_service.js \
    backend/services/ride_economy_service.js \
    backend/storage/database.js \
    backend/production/database_adapter.js
  do
    if [ -f "$f" ]; then
      echo
      echo "============================================================"
      echo "FILE: $f"
      echo "============================================================"
      cat "$f"
    fi
  done
} > "$OUT/035_runtime_candidate_contents.txt" 2>&1

echo "============================================================"
echo "36. TOP-LEVEL README / DOCUMENTATION"
echo "============================================================"

run 036_documentation_index \
  find . -maxdepth 3 -type f \( \
    -iname 'README*' -o \
    -iname '*AUDIT*' -o \
    -iname '*REPORT*' -o \
    -iname '*SITREP*' -o \
    -iname '*ARCHITECTURE*' -o \
    -iname '*TRUTH*' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | sort

echo "============================================================"
echo "37. EXISTING AUDIT DOCUMENTS"
echo "============================================================"

run 037_existing_audits \
  sh -c 'for f in $(find . -maxdepth 2 -type f \( -iname "*audit*" -o -iname "*truth*" -o -iname "*sitrep*" \) -not -path "./node_modules/*" -not -path "./.git/*"); do echo; echo "===== $f ====="; cat "$f"; done'

echo "============================================================"
echo "38. NPM SCRIPTS"
echo "============================================================"

run 038_npm_scripts \
  npm run

echo "============================================================"
echo "39. DEPENDENCY TREE"
echo "============================================================"

run 039_npm_dependencies \
  npm ls --depth=2

echo "============================================================"
echo "40. NODE VERSION"
echo "============================================================"

run 040_environment \
  node --version
  npm --version
  pwd

echo "============================================================"
echo "41. FORENSIC MANIFEST"
echo "============================================================"

{
  echo "CABLINK FORENSIC EVIDENCE"
  echo "Generated: $(date)"
  echo "Root: $ROOT"
  echo
  echo "Evidence directory:"
  echo "$OUT"
  echo
  echo "Files generated:"
  find "$OUT" -maxdepth 1 -type f -printf '%f\n' | sort
} > "$OUT/000_MANIFEST.txt"

echo
echo "============================================================"
echo "FORENSIC DISCOVERY COMPLETE"
echo "============================================================"
echo "Evidence directory:"
echo "$OUT"
echo
echo "Number of evidence files:"
find "$OUT" -maxdepth 1 -type f | wc -l
echo
echo "IMPORTANT:"
echo "No CabLink source files were modified by this script."
echo
echo "NEXT:"
echo "Share the contents of 000_MANIFEST.txt first."
echo "Then share evidence files progressively."
echo "DO NOT delete, move, rename, restore, or repair anything yet."
echo "============================================================"

