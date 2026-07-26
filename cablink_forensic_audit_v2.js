#!/usr/bin/env node

/**
 * ================================================================
 * CABLINK FORENSIC SYSTEM AUDIT v2
 * ================================================================
 *
 * PURPOSE
 * -------
 * Deep, READ-ONLY forensic audit of CabLink-pwa.
 *
 * This audit DOES NOT modify application source files.
 *
 * It investigates:
 *
 * 1. Repository architecture and actual entry points
 * 2. HTML / React / Vite architecture
 * 3. Script loading and module imports
 * 4. Missing local imports
 * 5. Syntax errors
 * 6. Frontend API calls
 * 7. Backend API route inventory
 * 8. Frontend <-> backend route matching
 * 9. Controllers / services / database references
 * 10. Firebase / blockchain / THB integrations
 * 11. Passenger operational flow
 * 12. Driver operational flow
 * 13. Admin / manager operational flow
 * 14. Ride lifecycle / state machine
 * 15. GPS / geolocation
 * 16. Maps / routing / Leaflet
 * 17. Distance calculations
 * 18. ETA calculations
 * 19. Fare calculations
 * 20. Petrol / fuel / vehicle economics
 * 21. Driver earnings / platform commission
 * 22. Payment / reward flow
 * 23. Duplicate implementations
 * 24. Archive / backup / competing architecture contamination
 * 25. Deployment configuration
 * 26. Environment variables / configuration
 * 27. Build evidence
 * 28. Missing components that should be created
 *
 * OUTPUT
 * ------
 * CABLINK_FORENSIC_AUDIT_V2_REPORT.md
 *
 * USAGE
 * -----
 * node cablink_forensic_audit_v2.js
 *
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();

const REPORT = path.join(ROOT, 'CABLINK_FORENSIC_AUDIT_V2_REPORT.md');

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'archive',
  'logs',
  'migration_backup',
  '.vscode',
  '.idea'
]);

const BACKUP_PATTERNS = [
  /\.bak$/i,
  /\.backup$/i,
  /\.disabled$/i,
  /\.backup_/i,
  /\.bak_/i,
  /_backup/i,
  /backup_/i
];

const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.json',
  '.py',
  '.sh'
]);

const CODE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html'
]);

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.json',
  '.md',
  '.py',
  '.sh',
  '.txt',
  '.env',
  '.example'
]);

// ================================================================
// UTILITIES
// ================================================================

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function exists(file) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function lineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function unique(arr) {
  return [...new Set(arr)];
}

function walk(dir, out = []) {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;

    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }

  return out;
}

function filesByExt(files, ext) {
  return files.filter(f => path.extname(f).toLowerCase() === ext);
}

function readPackageJson() {
  const file = path.join(ROOT, 'package.json');

  if (!exists(file)) {
    return null;
  }

  try {
    return JSON.parse(safeRead(file));
  } catch {
    return null;
  }
}

function section(title) {
  return [
    '',
    `## ${title}`,
    '',
  ];
}

function searchFiles(files, regexes, extensions = null) {
  const hits = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (extensions && !extensions.includes(ext)) continue;

    const content = safeRead(file);

    if (!content) continue;

    for (const regex of regexes) {
      if (regex.test(content)) {
        hits.push(rel(file));
        break;
      }
    }
  }

  return unique(hits);
}

function getMatches(files, regex, extensions = null) {
  const results = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (extensions && !extensions.includes(ext)) continue;

    const content = safeRead(file);

    if (!content) continue;

    let m;

    while ((m = regex.exec(content)) !== null) {
      results.push({
        file: rel(file),
        line: lineNumber(content, m.index),
        match: m[0]
      });

      if (!regex.global) break;
    }
  }

  return results;
}

// ================================================================
// 1. REPOSITORY INVENTORY
// ================================================================

function inventory(files) {
  const byTop = {};
  const byExt = {};
  const folders = new Set();

  for (const file of files) {
    const r = rel(file);
    const parts = r.split('/');

    const top = parts.length > 1 ? parts[0] : '(root)';

    byTop[top] = (byTop[top] || 0) + 1;

    const ext = path.extname(r).toLowerCase() || '(no extension)';

    byExt[ext] = (byExt[ext] || 0) + 1;

    let current = ROOT;

    for (const part of parts.slice(0, -1)) {
      current = path.join(current, part);
      folders.add(rel(current));
    }
  }

  return {
    totalFiles: files.length,
    totalFolders: folders.size,
    byTop,
    byExt
  };
}

// ================================================================
// 2. ARCHITECTURE / ENTRY POINT DETECTION
// ================================================================

function architecture(files, pkg) {
  const htmlFiles = filesByExt(files, '.html').map(rel);

  const jsxFiles = files.filter(f =>
    ['.jsx', '.tsx'].includes(path.extname(f).toLowerCase())
  ).map(rel);

  const jsFiles = filesByExt(files, '.js').map(rel);

  const entryCandidates = [];

  const candidatePaths = [
    'index.html',
    'frontend/index.html',
    'launcher.html',
    'frontend/src/main.jsx',
    'frontend/src/main.tsx',
    'src/main.jsx',
    'src/main.tsx',
    'frontend/main.jsx',
    'frontend/main.tsx',
    'frontend/js/app.js',
    'frontend/js/app_core.js'
  ];

  for (const c of candidatePaths) {
    if (exists(path.join(ROOT, c))) {
      entryCandidates.push(c);
    }
  }

  let viteConfig = null;

  for (const name of [
    'vite.config.js',
    'vite.config.mjs',
    'vite.config.ts'
  ]) {
    if (exists(path.join(ROOT, name))) {
      viteConfig = name;
      break;
    }
  }

  let packageScripts = {};

  if (pkg && pkg.scripts) {
    packageScripts = pkg.scripts;
  }

  const productionScripts = [];

  for (const [name, command] of Object.entries(packageScripts)) {
    if (
      /dev|start|build|preview|serve|prod/i.test(name) ||
      /vite|node|next|react|serve/i.test(command)
    ) {
      productionScripts.push({
        name,
        command
      });
    }
  }

  return {
    htmlFiles,
    jsxFiles,
    jsFiles,
    entryCandidates,
    viteConfig,
    packageScripts,
    productionScripts
  };
}

// ================================================================
// 3. HTML SCRIPT LOAD ANALYSIS
// ================================================================

function analyzeHtml(file) {
  const content = safeRead(file);

  const scripts = [];

  const scriptRegex =
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  let m;
  let index = 0;

  while ((m = scriptRegex.exec(content)) !== null) {
    index++;

    const attrs = m[1];
    const body = m[2];

    const srcMatch =
      attrs.match(/src\s*=\s*["']([^"']+)["']/i);

    const typeMatch =
      attrs.match(/type\s*=\s*["']([^"']+)["']/i);

    const src = srcMatch ? srcMatch[1] : null;

    let localExists = null;

    if (src && !/^https?:\/\//i.test(src)) {
      const clean = src.split('?')[0].replace(/^\//, '');

      const resolved = path.join(
        path.dirname(file),
        clean
      );

      localExists = exists(resolved);
    }

    scripts.push({
      block: index,
      line: lineNumber(content, m.index),
      src,
      type: typeMatch ? typeMatch[1] : null,
      inline: !src,
      localExists
    });
  }

  return scripts;
}

function analyzeAllHtml(files) {
  const results = [];

  for (const file of filesByExt(files, '.html')) {
    results.push({
      file: rel(file),
      scripts: analyzeHtml(file)
    });
  }

  return results;
}

// ================================================================
// 4. IMPORT / EXPORT ANALYSIS
// ================================================================

function resolveImport(baseFile, request) {
  if (!request.startsWith('.')) return null;

  const baseDir = path.dirname(baseFile);

  const raw = path.resolve(baseDir, request);

  const candidates = [
    raw,
    raw + '.js',
    raw + '.jsx',
    raw + '.ts',
    raw + '.tsx',
    raw + '.json',
    path.join(raw, 'index.js'),
    path.join(raw, 'index.jsx'),
    path.join(raw, 'index.ts'),
    path.join(raw, 'index.tsx')
  ];

  for (const c of candidates) {
    if (exists(c)) {
      return c;
    }
  }

  return null;
}

function analyzeImports(files) {
  const imports = [];
  const broken = [];

  const importRegex =
    /(?:import\s+(?:[\s\S]*?\s+from\s+)?|require\s*\(\s*)["']([^"']+)["']\s*\)?/g;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (!CODE_EXTENSIONS.has(ext)) continue;

    const content = safeRead(file);

    let m;

    while ((m = importRegex.exec(content)) !== null) {
      const request = m[1];

      if (!request.startsWith('.')) {
        imports.push({
          file: rel(file),
          line: lineNumber(content, m.index),
          request,
          local: false,
          resolved: true
        });

        continue;
      }

      const resolved = resolveImport(file, request);

      const record = {
        file: rel(file),
        line: lineNumber(content, m.index),
        request,
        local: true,
        resolved: !!resolved,
        target: resolved ? rel(resolved) : null
      };

      imports.push(record);

      if (!resolved) {
        broken.push(record);
      }
    }
  }

  return {
    imports,
    broken
  };
}

// ================================================================
// 5. API CALL EXTRACTION
// ================================================================

function extractFrontendApiCalls(files) {
  const calls = [];

  const patterns = [
    /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /axios\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /axios\s*\(\s*["'`]([^"'`]+)["'`]/g
  ];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (!['.js', '.jsx', '.ts', '.tsx', '.html'].includes(ext)) {
      continue;
    }

    const content = safeRead(file);

    for (const regex of patterns) {
      let m;

      while ((m = regex.exec(content)) !== null) {
        const pathValue =
          m.length >= 3 ? m[2] : m[1];

        if (!pathValue) continue;

        calls.push({
          file: rel(file),
          line: lineNumber(content, m.index),
          method:
            regex.source.includes('axios') &&
            m[1] &&
            /get|post|put|patch|delete/i.test(m[1])
              ? m[1].toUpperCase()
              : 'FETCH',
          path: pathValue
        });
      }
    }
  }

  return calls;
}

// ================================================================
// 6. BACKEND ROUTE EXTRACTION
// ================================================================

function extractBackendRoutes(files) {
  const routes = [];

  const routeRegex =
    /\.(get|post|put|patch|delete|use)\s*\(\s*["'`]([^"'`]+)["'`]/g;

  for (const file of files) {
    const r = rel(file);

    if (
      !r.startsWith('backend/') &&
      !r.startsWith('api/')
    ) {
      continue;
    }

    const content = safeRead(file);

    let m;

    while ((m = routeRegex.exec(content)) !== null) {
      routes.push({
        file: r,
        line: lineNumber(content, m.index),
        method: m[1].toUpperCase(),
        path: m[2]
      });
    }
  }

  return routes;
}

function normalizeApiPath(p) {
  if (!p) return '';

  return p
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}

function apiMatching(frontendCalls, backendRoutes) {
  const matched = [];
  const unmatched = [];

  for (const call of frontendCalls) {
    const clean = normalizeApiPath(
      call.path.split('?')[0]
    );

    if (
      clean.startsWith('http://') ||
      clean.startsWith('https://')
    ) {
      matched.push({
        ...call,
        status: 'EXTERNAL_OR_ABSOLUTE'
      });
      continue;
    }

    const candidates = backendRoutes.filter(route => {
      const backendPath =
        normalizeApiPath(route.path);

      const samePath =
        backendPath === clean ||
        backendPath
          .replace(/:\w+/g, ':param') ===
          clean.replace(/\/[^/]+$/g, '/:param');

      const methodCompatible =
        call.method === 'FETCH' ||
        route.method === call.method ||
        route.method === 'USE';

      return samePath && methodCompatible;
    });

    if (candidates.length) {
      matched.push({
        ...call,
        status: 'MATCHED',
        backend: candidates
      });
    } else {
      unmatched.push({
        ...call,
        status: 'NO_BACKEND_MATCH'
      });
    }
  }

  return {
    matched,
    unmatched
  };
}

// ================================================================
// 7. DATABASE / FIREBASE / BLOCKCHAIN
// ================================================================

function integrationScan(files) {
  const categories = {
    database: [
      /mongoose/i,
      /sequelize/i,
      /prisma/i,
      /knex/i,
      /sqlite/i,
      /postgres/i,
      /mysql/i,
      /supabase/i,
      /firebase.*firestore/i,
      /firestore/i
    ],

    firebase: [
      /firebase/i,
      /initializeApp/i,
      /getFirestore/i,
      /getAuth/i,
      /firebaseConfig/i
    ],

    blockchain: [
      /ethers/i,
      /Web3/i,
      /WalletConnect/i,
      /BSC/i,
      /BNB Smart Chain/i,
      /chainId/i,
      /THB/i,
      /THoBoCoin/i,
      /contract/i
    ],

    payment: [
      /payment/i,
      /paystack/i,
      /stripe/i,
      /transaction/i,
      /wallet/i,
      /deposit/i,
      /withdraw/i
    ],

    gps: [
      /navigator\.geolocation/i,
      /watchPosition/i,
      /getCurrentPosition/i,
      /Geolocation/i
    ],

    routing: [
      /leaflet/i,
      /L\.map/i,
      /routing/i,
      /route/i,
      /directions/i,
      /OSRM/i,
      /Google Maps/i,
      /Mapbox/i
    ],

    fuel: [
      /fuel/i,
      /petrol/i,
      /gasoline/i,
      /litre/i,
      /liter/i,
      /km\/l/i,
      /kmPerLitre/i,
      /fuelEfficiency/i,
      /fuelCost/i
    ]
  };

  const result = {};

  for (const [category, regexes] of Object.entries(categories)) {
    result[category] = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      if (!TEXT_EXTENSIONS.has(ext)) continue;

      const content = safeRead(file);

      for (const regex of regexes) {
        if (regex.test(content)) {
          result[category].push(rel(file));
          break;
        }
      }
    }

    result[category] = unique(result[category]);
  }

  return result;
}

// ================================================================
// 8. OPERATIONAL FLOW ANALYSIS
// ================================================================

function flowEvidence(files) {

  const checks = {

    passenger: {
      registration: [
        /register/i,
        /signup/i,
        /create.*account/i
      ],

      authentication: [
        /login/i,
        /signIn/i,
        /authenticate/i
      ],

      gps: [
        /navigator\.geolocation/i,
        /getCurrentPosition/i
      ],

      pickup: [
        /pickup/i,
        /pick.?up/i
      ],

      destination: [
        /destination/i,
        /dropoff/i,
        /drop.?off/i
      ],

      route: [
        /route/i,
        /directions/i,
        /routing/i
      ],

      fare: [
        /calculateFare/i,
        /calcTotalFare/i,
        /fare/i
      ],

      booking: [
        /bookRide/i,
        /requestRide/i,
        /create.*ride/i
      ],

      tracking: [
        /rideStatus/i,
        /pollRide/i,
        /trackRide/i,
        /watchPosition/i
      ],

      completion: [
        /completeRide/i,
        /ride.*completed/i
      ],

      reward: [
        /THB/i,
        /THoBoCoin/i,
        /reward/i,
        /claim/i
      ]
    },

    driver: {

      application: [
        /driver.*application/i,
        /apply.*driver/i
      ],

      approval: [
        /approve.*driver/i,
        /driver.*approved/i
      ],

      online: [
        /toggleDriverMode/i,
        /drivers\/online/i,
        /goOnline/i
      ],

      gps: [
        /navigator\.geolocation/i,
        /watchPosition/i,
        /driver.*location/i
      ],

      matching: [
        /match.*driver/i,
        /nearest.*driver/i,
        /driver.*request/i
      ],

      accept: [
        /acceptRide/i,
        /acceptRealRequest/i,
        /acceptRideRequest/i
      ],

      arrival: [
        /arrived/i,
        /driver.*arrived/i
      ],

      start: [
        /startRide/i,
        /ride.*started/i
      ],

      completion: [
        /completeRide/i,
        /completeRealRide/i
      ],

      earnings: [
        /earnings/i,
        /driver.*earn/i,
        /commission/i
      ]
    },

    admin: {

      dashboard: [
        /admin.*dashboard/i,
        /dashboard/i
      ],

      rides: [
        /admin.*ride/i,
        /dispatch/i,
        /active.*rides/i
      ],

      drivers: [
        /admin.*driver/i,
        /driver.*application/i,
        /drivers\/applications/i
      ],

      users: [
        /admin.*user/i,
        /manage.*user/i
      ],

      finance: [
        /revenue/i,
        /commission/i,
        /finance/i,
        /earnings/i
      ],

      monitoring: [
        /monitor/i,
        /health/i,
        /analytics/i
      ]
    }
  };

  const result = {};

  for (const [persona, areas] of Object.entries(checks)) {

    result[persona] = {};

    for (const [area, regexes] of Object.entries(areas)) {

      const hits = searchFiles(
        files,
        regexes,
        ['.js', '.jsx', '.ts', '.tsx', '.html', '.json']
      );

      result[persona][area] = {
        found: hits.length > 0,
        files: hits
      };
    }
  }

  return result;
}

// ================================================================
// 9. RIDE STATE MACHINE ANALYSIS
// ================================================================

function rideStateAnalysis(files) {

  const statePatterns = [
    /REQUESTED/i,
    /SEARCHING_DRIVER/i,
    /DRIVER_ASSIGNED/i,
    /DRIVER_ACCEPTED/i,
    /DRIVER_EN_ROUTE/i,
    /DRIVER_ARRIVED/i,
    /RIDE_STARTED/i,
    /RIDE_IN_PROGRESS/i,
    /RIDE_COMPLETED/i,
    /COMPLETED/i,
    /CANCELLED/i,
    /REJECTED/i,
    /NO_DRIVER/i
  ];

  const results = [];

  for (const file of files) {

    const ext = path.extname(file).toLowerCase();

    if (!CODE_EXTENSIONS.has(ext)) continue;

    const content = safeRead(file);

    const found = [];

    for (const regex of statePatterns) {

      if (regex.test(content)) {
        found.push(regex.source);
      }
    }

    if (found.length) {

      results.push({
        file: rel(file),
        states: unique(found)
      });
    }
  }

  return results;
}

// ================================================================
// 10. CORE FUNCTION DUPLICATION
// ================================================================

function duplicateCoreFunctions(files) {

  const names = [
    'bookRide',
    'requestRide',
    'toggleDriverMode',
    'acceptRide',
    'acceptRealRequest',
    'acceptRideRequest',
    'completeRide',
    'completeRealRide',
    'calculateFare',
    'calcTotalFare',
    'updateFareBreakdown',
    'updateFareDisplay',
    'haversineKm',
    'getRideDistance',
    'calculateDistance',
    'calculateETA',
    'getCurrentPosition',
    'watchPosition',
    'pollForRideRequests',
    'pollOnlineDrivers',
    'matchDriver',
    'findNearestDriver'
  ];

  const result = {};

  for (const name of names) {

    result[name] = [];

    const regexes = [

      new RegExp(
        `\\bfunction\\s+${name}\\s*\\(`,
        'g'
      ),

      new RegExp(
        `(?:const|let|var)\\s+${name}\\s*=`,
        'g'
      ),

      new RegExp(
        `window\\.${name}\\s*=`,
        'g'
      )
    ];

    for (const file of files) {

      const ext = path.extname(file).toLowerCase();

      if (!CODE_EXTENSIONS.has(ext)) continue;

      const content = safeRead(file);

      for (const regex of regexes) {

        let m;

        while ((m = regex.exec(content)) !== null) {

          result[name].push({
            file: rel(file),
            line: lineNumber(content, m.index)
          });
        }
      }
    }
  }

  return result;
}

// ================================================================
// 11. FARE / FUEL / DISTANCE EVIDENCE
// ================================================================

function economicsAnalysis(files) {

  const categories = {

    distance: [
      /haversine/i,
      /distance/i,
      /kilometer/i,
      /\bkm\b/i
    ],

    roadDistance: [
      /route.*distance/i,
      /distance.*route/i,
      /legs/i,
      /directions/i,
      /OSRM/i,
      /Mapbox/i,
      /Google Maps/i
    ],

    eta: [
      /ETA/i,
      /estimated.*time/i,
      /duration/i,
      /travel.*time/i
    ],

    fare: [
      /calculateFare/i,
      /calcTotalFare/i,
      /baseFare/i,
      /distanceFare/i,
      /timeFare/i,
      /fare/i
    ],

    fuel: [
      /fuel/i,
      /petrol/i,
      /gasoline/i,
      /fuelEfficiency/i,
      /fuelCost/i,
      /kmPerLitre/i,
      /kmPerLiter/i
    ],

    earnings: [
      /driverEarnings/i,
      /earnings/i,
      /commission/i,
      /platformFee/i,
      /netEarnings/i
    ],

    currency: [
      /BWP/i,
      /Pula/i,
      /pula/i,
      /currency/i
    ]
  };

  const result = {};

  for (const [category, regexes] of Object.entries(categories)) {

    result[category] = [];

    for (const file of files) {

      const ext = path.extname(file).toLowerCase();

      if (!TEXT_EXTENSIONS.has(ext)) continue;

      const content = safeRead(file);

      for (const regex of regexes) {

        if (regex.test(content)) {

          result[category].push(rel(file));

          break;
        }
      }
    }

    result[category] =
      unique(result[category]);
  }

  return result;
}

// ================================================================
// 12. ENVIRONMENT / CONFIGURATION
// ================================================================

function configAnalysis(files) {

  const configFiles = [];

  const names = [
    '.env',
    '.env.example',
    '.env.local',
    '.env.production',
    '.env.development',
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json',
    'vercel.json',
    'netlify.toml',
    'vite.config.js',
    'vite.config.mjs',
    'vite.config.ts'
  ];

  for (const name of names) {

    if (exists(path.join(ROOT, name))) {
      configFiles.push(name);
    }
  }

  const envReferences = [];

  for (const file of files) {

    const ext = path.extname(file).toLowerCase();

    if (!TEXT_EXTENSIONS.has(ext)) continue;

    const content = safeRead(file);

    if (
      /process\.env/i.test(content) ||
      /import\.meta\.env/i.test(content)
    ) {

      envReferences.push(rel(file));
    }
  }

  return {
    configFiles,
    envReferences: unique(envReferences)
  };
}

// ================================================================
// 13. DEPLOYMENT ANALYSIS
// ================================================================

function deploymentAnalysis(files) {

  const deploymentFiles = [];

  for (const file of files) {

    const r = rel(file);

    if (
      /deploy/i.test(r) ||
      /vercel/i.test(r) ||
      /netlify/i.test(r) ||
      /firebase/i.test(r)
    ) {

      deploymentFiles.push(r);
    }
  }

  return unique(deploymentFiles);
}

// ================================================================
// 14. SYNTAX CHECK
// ================================================================

function syntaxCheck(files) {

  const results = [];

  const tmp = path.join(
    ROOT,
    '.__cablink_forensic_check__.js'
  );

  for (const file of files) {

    if (path.extname(file).toLowerCase() !== '.js') {
      continue;
    }

    const content = safeRead(file);

    try {

      fs.writeFileSync(
        tmp,
        content,
        'utf8'
      );

      cp.execFileSync(
        process.execPath,
        ['--check', tmp],
        {
          stdio: 'pipe'
        }
      );

      results.push({
        file: rel(file),
        ok: true
      });

    } catch (e) {

      results.push({
        file: rel(file),
        ok: false,
        error:
          (
            e.stderr
              ? e.stderr.toString()
              : e.message || String(e)
          )
            .split('\n')
            .slice(0, 8)
            .join('\n')
      });

    } finally {

      try {
        fs.unlinkSync(tmp);
      } catch {}
    }
  }

  return results;
}

// ================================================================
// 15. BUILD ANALYSIS
// ================================================================

function buildAnalysis(pkg) {

  const result = {
    packageExists: !!pkg,
    scripts: pkg ? pkg.scripts || {} : {},
    dependencies: pkg ? pkg.dependencies || {} : {},
    devDependencies: pkg ? pkg.devDependencies || {} : {},
    buildCommandFound: false,
    buildOutputExists: exists(path.join(ROOT, 'dist'))
  };

  if (pkg && pkg.scripts) {

    result.buildCommandFound =
      !!pkg.scripts.build;
  }

  return result;
}

// ================================================================
// 16. GENERATE REPORT
// ================================================================

function generateReport(data) {

  const L = [];

  L.push('# CABLINK FORENSIC SYSTEM AUDIT v2');
  L.push('');
  L.push(`Generated: ${new Date().toISOString()}`);
  L.push(`Repository: ${ROOT}`);
  L.push('');
  L.push('> READ-ONLY AUDIT. No application source files were modified.');
  L.push('');
  L.push('This report is an evidence-based static forensic analysis. It identifies architectural conflicts, broken references, missing connections, duplicated logic, and likely operational gaps. It does not claim that a feature is runtime-healthy merely because a function or route exists.');
  L.push('');

  // ============================================================
  // EXECUTIVE SUMMARY
  // ============================================================

  L.push('## EXECUTIVE SUMMARY');
  L.push('');

  const brokenJs =
    data.syntax.filter(x => !x.ok);

  const brokenImports =
    data.imports.broken;

  const unmatchedApi =
    data.api.unmatched;

  const duplicateNames =
    Object.entries(data.duplicates)
      .filter(([name, defs]) => defs.length > 1);

  L.push(`- Total files scanned: **${data.inventory.totalFiles}**`);
  L.push(`- Total folders discovered: **${data.inventory.totalFolders}**`);
  L.push(`- JavaScript syntax errors: **${brokenJs.length}**`);
  L.push(`- Broken local imports: **${brokenImports.length}**`);
  L.push(`- Frontend API calls without a detected backend match: **${unmatchedApi.length}**`);
  L.push(`- Core functions with duplicate implementations: **${duplicateNames.length}**`);
  L.push(`- HTML entry candidates detected: **${data.architecture.entryCandidates.length}**`);
  L.push(`- Vite configuration: **${data.architecture.viteConfig || 'NOT FOUND'}**`);
  L.push(`- Production build directory: **${data.build.buildOutputExists ? 'FOUND' : 'NOT FOUND'}**`);
  L.push('');

  L.push('### Immediate risk classification');
  L.push('');

  if (brokenJs.length) {
    L.push('- 🔴 **CRITICAL:** JavaScript syntax errors exist.');
  }

  if (brokenImports.length) {
    L.push('- 🔴 **CRITICAL:** Local imports reference files that cannot be resolved.');
  }

  if (unmatchedApi.length) {
    L.push('- 🔴 **HIGH:** Frontend API calls exist without a detected backend route match.');
  }

  if (duplicateNames.length) {
    L.push('- 🟠 **HIGH:** Multiple competing implementations of core business functions exist.');
  }

  if (
    data.architecture.entryCandidates.length > 1
  ) {
    L.push('- 🟠 **HIGH:** Multiple possible application entry points exist. Determine the single canonical production entry.');
  }

  if (
    data.economics.roadDistance.length === 0
  ) {
    L.push('- 🟠 **HIGH:** No strong evidence of a dedicated road-distance calculation was found. Haversine distance alone is insufficient for authoritative taxi fare calculation.');
  }

  if (
    data.economics.fuel.length === 0
  ) {
    L.push('- 🟡 **MEDIUM:** No strong fuel/petrol economics implementation was detected.');
  }

  L.push('');

  // ============================================================
  // REPOSITORY
  // ============================================================

  L.push(...section('1. REPOSITORY STRUCTURE'));

  L.push(`Total files: **${data.inventory.totalFiles}**`);
  L.push(`Total folders: **${data.inventory.totalFolders}**`);
  L.push('');

  L.push('### Files by top-level area');
  L.push('');

  Object.entries(data.inventory.byTop)
    .sort((a,b) => b[1] - a[1])
    .forEach(([name, count]) => {
      L.push(`- \`${name}\`: ${count}`);
    });

  L.push('');

  L.push('### Files by extension');
  L.push('');

  Object.entries(data.inventory.byExt)
    .sort((a,b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      L.push(`- \`${ext}\`: ${count}`);
    });

  // ============================================================
  // ARCHITECTURE
  // ============================================================

  L.push(...section('2. ACTUAL APPLICATION ARCHITECTURE'));

  L.push('### Potential entry points');
  L.push('');

  data.architecture.entryCandidates.forEach(x => {
    L.push(`- \`${x}\``);
  });

  L.push('');

  L.push('### HTML files');
  L.push('');

  data.architecture.htmlFiles.forEach(x => {
    L.push(`- \`${x}\``);
  });

  L.push('');

  L.push('### React / JSX / TSX files');
  L.push('');

  L.push(`React-like source files detected: ${data.architecture.jsxFiles.length}`);

  data.architecture.jsxFiles.slice(0, 100).forEach(x => {
    L.push(`- \`${x}\``);
  });

  if (data.architecture.jsxFiles.length > 100) {
    L.push(`- ... ${data.architecture.jsxFiles.length - 100} more`);
  }

  L.push('');

  L.push(`Vite configuration: ${data.architecture.viteConfig || 'NOT FOUND'}`);
  L.push('');

  L.push('### Package scripts');
  L.push('');

  for (const [name, command] of Object.entries(
    data.architecture.packageScripts
  )) {
    L.push(`- \`${name}\`: \`${command}\``);
  }

  L.push('');

  L.push('### Likely production/development commands');
  L.push('');

  data.architecture.productionScripts.forEach(x => {
    L.push(`- \`${x.name}\`: \`${x.command}\``);
  });

  // ============================================================
  // HTML SCRIPTS
  // ============================================================

  L.push(...section('3. HTML SCRIPT LOADING AND ENTRYPOINT HEALTH'));

  for (const html of data.htmlScripts) {

    L.push(`### ${html.file}`);
    L.push('');

    if (!html.scripts.length) {
      L.push('- No `<script>` tags detected.');
      L.push('');
      continue;
    }

    for (const s of html.scripts) {

      if (s.inline) {

        L.push(
          `- Inline script #${s.block} at approximately line ${s.line}`
        );

      } else {

        const status =
          s.localExists === null
            ? 'external'
            : s.localExists
              ? 'FOUND'
              : 'MISSING';

        L.push(
          `- Script #${s.block}: \`${s.src}\` — ${status}`
        );
      }
    }

    L.push('');
  }

  // ============================================================
  // IMPORTS
  // ============================================================

  L.push(...section('4. IMPORT / MODULE INTEGRITY'));

  L.push(`Total imports/requires detected: ${data.imports.all.length}`);
  L.push(`Broken local imports: ${data.imports.broken.length}`);
  L.push('');

  if (data.imports.broken.length) {

    L.push('### BROKEN LOCAL IMPORTS');

    data.imports.broken.forEach(x => {

      L.push(
        `- ❌ ${x.file}:${x.line} → \`${x.request}\``
      );

    });

  } else {

    L.push('✅ No unresolved local imports detected by static resolution.');
  }

  // ============================================================
  // SYNTAX
  // ============================================================

  L.push(...section('5. JAVASCRIPT SYNTAX HEALTH'));

  L.push(
    `Checked JavaScript files: ${data.syntax.length}`
  );

  L.push(
    `Broken JavaScript files: ${brokenJs.length}`
  );

  L.push('');

  brokenJs.forEach(x => {

    L.push(`### ❌ ${x.file}`);
    L.push('');
    L.push('```text');
    L.push(x.error || 'Unknown syntax error');
    L.push('```');
    L.push('');
  });

  if (!brokenJs.length) {
    L.push('✅ No standalone `.js` syntax errors detected.');
  }

  // ============================================================
  // API
  // ============================================================

  L.push(...section('6. FRONTEND → BACKEND API FORENSIC CHECK'));

  L.push(`Frontend API calls detected: ${data.api.frontend.length}`);
  L.push(`Backend routes detected: ${data.api.backend.length}`);
  L.push(`Matched API calls: ${data.api.matched.length}`);
  L.push(`Unmatched API calls: ${data.api.unmatched.length}`);
  L.push('');

  if (data.api.unmatched.length) {

    L.push('### FRONTEND CALLS WITH NO DETECTED BACKEND MATCH');

    data.api.unmatched.forEach(x => {

      L.push(
        `- ❌ ${x.method} ${x.path} — ${x.file}:${x.line}`
      );

    });

  }

  L.push('');

  L.push('### BACKEND ROUTE INVENTORY');

  data.api.backend.forEach(x => {

    L.push(
      `- ${x.method} ${x.path} — ${x.file}:${x.line}`
    );

  });

  // ============================================================
  // INTEGRATIONS
  // ============================================================

  L.push(...section('7. INTEGRATION INVENTORY'));

  for (const [category, files] of Object.entries(
    data.integrations
  )) {

    L.push(`### ${category.toUpperCase()}`);
    L.push('');

    if (!files.length) {

      L.push('- No evidence detected.');

    } else {

      files.forEach(x => {
        L.push(`- ${x}`);
      });

    }

    L.push('');
  }

  // ============================================================
  // FLOWS
  // ============================================================

  L.push(...section('8. PASSENGER OPERATIONAL FLOW'));

  for (const [area, result] of Object.entries(
    data.flows.passenger
  )) {

    L.push(
      `- ${result.found ? '✅' : '❌'} **${area}**`
    );

    if (result.files.length) {

      L.push(
        `  Evidence: ${result.files.slice(0, 8).join(', ')}`
      );
    }
  }

  L.push('');

  L.push('### Recommended passenger canonical flow');

  L.push('');

  L.push(
`REGISTER/AUTHENTICATE
→ GPS PERMISSION
→ PICKUP LOCATION
→ DESTINATION
→ ROAD ROUTE
→ ROAD DISTANCE
→ ETA
→ FARE ESTIMATE
→ RIDE REQUEST
→ DRIVER MATCH
→ DRIVER ACCEPT
→ DRIVER TRACKING
→ DRIVER ARRIVAL
→ RIDE START
→ RIDE IN PROGRESS
→ RIDE COMPLETION
→ FINAL FARE
→ PAYMENT SETTLEMENT
→ THB REWARD ELIGIBILITY
→ REWARD CLAIM`
  );

  L.push('');

  // DRIVER

  L.push(...section('9. DRIVER OPERATIONAL FLOW'));

  for (const [area, result] of Object.entries(
    data.flows.driver
  )) {

    L.push(
      `- ${result.found ? '✅' : '❌'} **${area}**`
    );

    if (result.files.length) {

      L.push(
        `  Evidence: ${result.files.slice(0, 8).join(', ')}`
      );
    }
  }

  L.push('');

  L.push('### Recommended driver canonical flow');

  L.push('');

  L.push(
`DRIVER APPLICATION
→ ADMIN APPROVAL
→ DRIVER AUTHENTICATION
→ VEHICLE PROFILE
→ ONLINE
→ GPS LOCATION STREAM
→ DRIVER MATCHING
→ RIDE REQUEST
→ ACCEPT
→ NAVIGATE TO PICKUP
→ ARRIVE
→ START RIDE
→ TRACK TRIP
→ COMPLETE RIDE
→ FINAL FARE
→ DRIVER EARNINGS
→ PLATFORM COMMISSION
→ THB REWARD PROCESSING`
  );

  L.push('');

  // ADMIN

  L.push(...section('10. ADMIN / MANAGER OPERATIONAL FLOW'));

  for (const [area, result] of Object.entries(
    data.flows.admin
  )) {

    L.push(
      `- ${result.found ? '✅' : '❌'} **${area}**`
    );

    if (result.files.length) {

      L.push(
        `  Evidence: ${result.files.slice(0, 8).join(', ')}`
      );
    }
  }

  L.push('');

  L.push('### Recommended manager control plane');

  L.push('');

  L.push(
`ADMIN LOGIN
→ OPERATIONS DASHBOARD
→ ACTIVE RIDES
→ UNASSIGNED RIDES
→ DRIVER MAP
→ ONLINE/OFFLINE DRIVERS
→ DRIVER APPLICATIONS
→ DRIVER APPROVAL
→ PASSENGER MANAGEMENT
→ DISPATCH
→ FARE OVERSIGHT
→ DRIVER EARNINGS
→ PLATFORM COMMISSION
→ PAYMENTS
→ THB REWARDS
→ SYSTEM HEALTH
→ AUDIT LOGS`
  );

  // ============================================================
  // RIDE STATES
  // ============================================================

  L.push(...section('11. RIDE STATE MACHINE FORENSICS'));

  L.push(
    '### States detected in source'
  );

  L.push('');

  if (!data.rideStates.length) {

    L.push(
      '❌ No explicit ride state constants were detected.'
    );

  } else {

    data.rideStates.forEach(x => {

      L.push(`#### ${x.file}`);

      x.states.forEach(s => {
        L.push(`- ${s}`);
      });

      L.push('');
    });
  }

  L.push('');

  L.push('### Recommended authoritative state machine');

  L.push('');

  L.push(
`REQUESTED
→ SEARCHING_DRIVER
→ DRIVER_ASSIGNED
→ DRIVER_ACCEPTED
→ DRIVER_EN_ROUTE
→ DRIVER_ARRIVED
→ RIDE_STARTED
→ RIDE_IN_PROGRESS
→ RIDE_COMPLETED
→ FARE_FINALIZED
→ PAYMENT_SETTLED
→ REWARD_ELIGIBLE
→ REWARD_CLAIMED

Alternative terminal states:
→ CANCELLED
→ NO_DRIVER
→ FAILED`
  );

  // ============================================================
  // GPS / ROUTING
  // ============================================================

  L.push(...section('12. GPS / ROUTING / LOCATION FORENSICS'));

  L.push(
    `GPS-related files: ${data.integrations.gps.length}`
  );

  data.integrations.gps.forEach(x => {
    L.push(`- ${x}`);
  });

  L.push('');

  L.push(
    `Routing/map-related files: ${data.integrations.routing.length}`
  );

  data.integrations.routing.forEach(x => {
    L.push(`- ${x}`);
  });

  L.push('');

  L.push(
    '### Critical architecture distinction'
  );

  L.push('');

  L.push(
`GPS coordinates should be used for:
- Current passenger location
- Current driver location
- Driver proximity
- Location tracking

Road routing should be used for:
- Actual driving distance
- ETA
- Route geometry
- Authoritative fare distance`
  );

  L.push('');

  if (
    data.economics.roadDistance.length === 0
  ) {

    L.push(
      '🔴 **WARNING:** No strong evidence of a dedicated road-distance engine was detected.'
    );

    L.push(
      'Haversine distance should not be treated as authoritative driving distance for taxi fares.'
    );
  }

  // ============================================================
  // ECONOMICS
  // ============================================================

  L.push(...section('13. FARE / DISTANCE / ETA / PETROL / EARNINGS FORENSICS'));

  for (const [category, files] of Object.entries(
    data.economics
  )) {

    L.push(
      `### ${category.toUpperCase()}`
    );

    L.push('');

    if (!files.length) {

      L.push(
        '- ❌ No strong implementation evidence detected.'
      );

    } else {

      files.forEach(x => {
        L.push(`- ${x}`);
      });

    }

    L.push('');
  }

  L.push('### Recommended fare architecture');

  L.push('');

  L.push(
`AUTHORITATIVE BACKEND FARE ENGINE

Base Fare
+
Road Distance × Distance Rate
+
Travel Time × Time Rate
+
Waiting Time × Waiting Rate
+
Surcharges
-
Discounts
=
Passenger Fare

Then separately:

Passenger Fare
-
Platform Commission
-
Other Platform Fees
=
Driver Gross Settlement

Then separately:

Vehicle Operating Cost
=
Road Distance
÷
Vehicle Fuel Efficiency
×
Petrol Price

Driver Net Operating Profit
=
Driver Settlement
-
Fuel Cost
-
Other Operating Costs`
  );

  L.push('');

  L.push(
    'IMPORTANT: Petrol/fuel cost should be treated as an operating-cost calculation unless the business explicitly incorporates it into the fare model.'
  );

  // ============================================================
  // DUPLICATES
  // ============================================================

  L.push(...section('14. DUPLICATE / COMPETING CORE LOGIC'));

  for (const [name, defs] of Object.entries(
    data.duplicates
  )) {

    if (defs.length > 1) {

      L.push(
        `### ${name} — ${defs.length} definitions`
      );

      defs.forEach(x => {

        L.push(
          `- ${x.file}:${x.line}`
        );

      });

      L.push('');
    }
  }

  // ============================================================
  // CONFIG
  // ============================================================

  L.push(...section('15. CONFIGURATION / ENVIRONMENT'));

  L.push('### Configuration files');

  data.config.configFiles.forEach(x => {
    L.push(`- ${x}`);
  });

  L.push('');

  L.push('### Files referencing environment variables');

  data.config.envReferences.forEach(x => {
    L.push(`- ${x}`);
  });

  // ============================================================
  // DEPLOYMENT
  // ============================================================

  L.push(...section('16. DEPLOYMENT FORENSICS'));

  data.deployment.forEach(x => {
    L.push(`- ${x}`);
  });

  if (!data.deployment.length) {
    L.push('- No deployment configuration evidence detected.');
  }

  // ============================================================
  // BUILD
  // ============================================================

  L.push(...section('17. BUILD HEALTH'));

  L.push(
    `package.json present: ${data.build.packageExists ? 'YES' : 'NO'}`
  );

  L.push(
    `Build script present: ${data.build.buildCommandFound ? 'YES' : 'NO'}`
  );

  L.push(
    `dist/ present: ${data.build.buildOutputExists ? 'YES' : 'NO'}`
  );

  L.push('');

  // ============================================================
  // MISSING / CREATE
  // ============================================================

  L.push(...section('18. WHAT SHOULD BE CREATED OR CONSOLIDATED'));

  let priority = 1;

  if (brokenJs.length) {

    L.push(
      `${priority++}. 🔴 Fix the JavaScript syntax error(s) before any feature work.`
    );
  }

  if (brokenImports.length) {

    L.push(
      `${priority++}. 🔴 Repair unresolved local imports.`
    );
  }

  if (
    data.architecture.entryCandidates.length > 1
  ) {

    L.push(
      `${priority++}. 🔴 Establish ONE canonical production entry point.`
    );
  }

  if (duplicateNames.length) {

    L.push(
      `${priority++}. 🔴 Consolidate duplicate core functions into single authoritative services.`
    );
  }

  if (unmatchedApi.length) {

    L.push(
      `${priority++}. 🔴 Resolve frontend API calls that have no detected backend route.`
    );
  }

  if (
    data.economics.roadDistance.length === 0
  ) {

    L.push(
      `${priority++}. 🟠 Create or integrate a canonical road-routing/distance service.`
    );
  }

  if (
    data.economics.eta.length === 0
  ) {

    L.push(
      `${priority++}. 🟠 Create a canonical ETA calculation service.`
    );
  }

  if (
    data.economics.fuel.length === 0
  ) {

    L.push(
      `${priority++}. 🟡 Create a separate vehicle operating-cost/fuel economics module if fuel economics is part of CabLink's business model.`
    );
  }

  if (
    data.flows.admin.dashboard.found === false
  ) {

    L.push(
      `${priority++}. 🟠 Create a real admin operations dashboard.`
    );
  }

  L.push(
    `${priority++}. 🟠 Create a single authoritative ride state machine shared by frontend and backend.`
  );

  L.push(
    `${priority++}. 🟠 Create a canonical location service for passenger and driver GPS.`
  );

  L.push(
    `${priority++}. 🟠 Create a canonical fare engine on the backend; frontend should only display estimates.`
  );

  L.push(
    `${priority++}. 🟡 Create end-to-end automated tests covering passenger → driver → completion.`
  );

  L.push(
    `${priority++}. 🟡 Create operational audit logging for ride state transitions, payments, driver actions, and admin actions.`
  );

  L.push(
    `${priority++}. 🟡 Create explicit separation between passenger fare, driver settlement, platform commission, and fuel operating costs.`
  );

  L.push('');

  // ============================================================
  // FINAL ARCHITECTURE TARGET
  // ============================================================

  L.push(...section('19. RECOMMENDED CANONICAL CABLINK ARCHITECTURE'));

  L.push(
`CABLINK
│
├── FRONTEND
│   ├── Passenger App
│   ├── Driver App
│   └── Admin / Manager Console
│
├── SHARED SERVICES
│   ├── Auth Service
│   ├── Location Service
│   ├── Routing Service
│   ├── Distance Service
│   ├── ETA Service
│   ├── Fare Engine
│   └── Ride State Machine
│
├── BACKEND
│   ├── Auth API
│   ├── Passenger API
│   ├── Driver API
│   ├── Ride API
│   ├── Dispatch API
│   ├── Admin API
│   ├── Payment API
│   └── Reward API
│
├── DATA
│   ├── Users
│   ├── Passengers
│   ├── Drivers
│   ├── Vehicles
│   ├── Driver Locations
│   ├── Rides
│   ├── Payments
│   ├── Driver Settlements
│   ├── Platform Commissions
│   └── THB Rewards
│
└── OPERATIONS
    ├── GPS Monitoring
    ├── Dispatch
    ├── Ride Monitoring
    ├── Finance
    ├── Driver Management
    └── Audit Logs`
  );

  L.push('');

  // ============================================================
  // FINAL VERDICT
  // ============================================================

  L.push(...section('20. FORENSIC VERDICT'));

  L.push(
    'This audit should be treated as the Stage 2 structural and integration truth layer.'
  );

  L.push('');

  L.push(
    'The most important question after running this report is not "How many files exist?" but "Which files actually participate in the production runtime?"'
  );

  L.push('');

  L.push(
    'Before modifying CabLink again, identify the canonical frontend entry point, canonical backend entry point, canonical database, canonical ride state machine, canonical location service, canonical routing service, and canonical fare engine.'
  );

  L.push('');

  L.push(
    'Any implementation outside those canonical paths should be classified as active, deprecated, experimental, archived, or dead. This prevents another partial merge from causing the application-wide failure you experienced.'
  );

  L.push('');

  return L.join('\n');
}

// ================================================================
// MAIN
// ================================================================

function main() {

  console.log('');
  console.log('==============================================================');
  console.log(' CABLINK FORENSIC SYSTEM AUDIT v2');
  console.log('==============================================================');
  console.log(` Root: ${ROOT}`);
  console.log(' READ-ONLY');
  console.log('==============================================================');
  console.log('');

  const files = walk(ROOT);

  console.log(`Files discovered: ${files.length}`);

  const pkg = readPackageJson();

  console.log('Analyzing repository structure...');

  const inv =
    inventory(files);

  console.log('Detecting architecture and entry points...');

  const arch =
    architecture(files, pkg);

  console.log('Analyzing HTML script loading...');

  const htmlScripts =
    analyzeAllHtml(files);

  console.log('Analyzing imports and module references...');

  const imports =
    analyzeImports(files);

  console.log('Extracting frontend API calls...');

  const frontendApi =
    extractFrontendApiCalls(files);

  console.log('Extracting backend routes...');

  const backendRoutes =
    extractBackendRoutes(files);

  console.log('Matching frontend API calls to backend routes...');

  const api =
    apiMatching(
      frontendApi,
      backendRoutes
    );

  console.log('Scanning integrations...');

  const integrations =
    integrationScan(files);

  console.log('Analyzing passenger / driver / admin flows...');

  const flows =
    flowEvidence(files);

  console.log('Analyzing ride state machine...');

  const rideStates =
    rideStateAnalysis(files);

  console.log('Detecting duplicate core logic...');

  const duplicates =
    duplicateCoreFunctions(files);

  console.log('Analyzing fare / GPS / routing / petrol economics...');

  const economics =
    economicsAnalysis(files);

  console.log('Analyzing configuration...');

  const config =
    configAnalysis(files);

  console.log('Analyzing deployment...');

  const deployment =
    deploymentAnalysis(files);

  console.log('Checking JavaScript syntax...');

  const syntax =
    syntaxCheck(files);

  console.log('Checking build configuration...');

  const build =
    buildAnalysis(pkg);

  const report =
    generateReport({
      inventory: inv,
      architecture: arch,
      htmlScripts,
      imports: {
        all: imports.imports,
        broken: imports.broken
      },
      api: {
        frontend: frontendApi,
        backend: backendRoutes,
        matched: api.matched,
        unmatched: api.unmatched
      },
      integrations,
      flows,
      rideStates,
      duplicates,
      economics,
      config,
      deployment,
      syntax,
      build
    });

  fs.writeFileSync(
    REPORT,
    report,
    'utf8'
  );

  console.log('');
  console.log('==============================================================');
  console.log(' FORENSIC AUDIT COMPLETE');
  console.log('==============================================================');
  console.log(`Files scanned: ${files.length}`);
  console.log(`JS syntax errors: ${syntax.filter(x => !x.ok).length}`);
  console.log(`Broken local imports: ${imports.broken.length}`);
  console.log(`Frontend API calls: ${frontendApi.length}`);
  console.log(`Backend routes: ${backendRoutes.length}`);
  console.log(`Unmatched API calls: ${api.unmatched.length}`);
  console.log(
    `Duplicate core functions: ${
      Object.values(duplicates)
        .filter(x => x.length > 1)
        .length
    }`
  );
  console.log('');
  console.log(`REPORT: ${REPORT}`);
  console.log('');
  console.log('No application source files were modified.');
  console.log('==============================================================');
}

main();

