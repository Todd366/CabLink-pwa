const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const targets = [
  "index.html",
  "frontend/js/app.js",
  "frontend/js/core.js",
  "frontend/js/app_core.js",
  "frontend/js/app_engine.js",
  "frontend/css/style.css"
];

let failures = 0;
let warnings = 0;

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  try {
    return fs.readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    return "";
  }
}

function pass(message) {
  console.log("✓ PASS:", message);
}

function warn(message) {
  console.log("⚠ WARN:", message);
  warnings++;
}

function fail(message) {
  console.log("✗ FAIL:", message);
  failures++;
}

function section(title) {
  console.log(`
================================================================================
${title}
================================================================================
`);
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

console.log(`
================================================================================
CABLINK STAGE 4G.10 — UI HEALTH + CLEANLINESS SURGICAL AUDIT
================================================================================

READ-ONLY AUDIT
NO FILES WILL BE MODIFIED
NO BLOCKCHAIN TRANSACTION WILL BE SENT
NO TOKEN TRANSFER WILL BE EXECUTED
NO BUSINESS LOGIC WILL BE CHANGED

Purpose:
  1. Validate frontend files
  2. Detect JavaScript syntax errors
  3. Map script loading order
  4. Detect duplicate DOM IDs
  5. Detect missing JavaScript DOM targets
  6. Detect inline event-handler risks
  7. Detect undefined UI action references
  8. Detect duplicate function definitions
  9. Validate navigation targets
  10. Inspect booking/driver/reward/wallet UI dependencies
  11. Detect missing frontend modules
  12. Produce a surgical UI repair map

================================================================================
`);

section("1. FRONTEND FILE EXISTENCE");

for (const file of targets) {
  if (exists(file)) {
    const content = read(file);

    pass(
      `${file} exists — ${content.split("\n").length} lines, ${Buffer.byteLength(content, "utf8")} bytes`
    );
  } else {
    warn(`${file} is missing`);
  }
}

section("2. JAVASCRIPT SYNTAX VALIDATION");

const jsFiles = targets.filter(
  file => file.endsWith(".js") && exists(file)
);

for (const file of jsFiles) {
  const tempDir = path.join(ROOT, ".cablink-ui-audit-tmp");

  fs.mkdirSync(tempDir, { recursive: true });

  const temp = path.join(
    tempDir,
    "cablink_ui_check_" +
      file.replace(/[^a-zA-Z0-9]/g, "_") +
      "_" +
      process.pid +
      ".js"
  );

  try {
    fs.writeFileSync(
      temp,
      read(file),
      "utf8"
    );

    const { spawnSync } = require("child_process");

    const result = spawnSync(
      process.execPath,
      ["--check", temp],
      {
        encoding: "utf8"
      }
    );

    if (result.status === 0) {
      pass(`JavaScript syntax valid: ${file}`);
    } else {
      fail(`JavaScript syntax error: ${file}`);

      if (result.stderr) {
        console.log(
          result.stderr.trim()
        );
      }
    }

  } finally {
    try {
      fs.unlinkSync(temp);
    } catch {}
  }
}

try {
  fs.rmSync(
    path.join(ROOT, ".cablink-ui-audit-tmp"),
    { recursive: true, force: true }
  );
} catch {}

try {
  fs.rmSync(
    path.join(ROOT, ".cablink-ui-audit-tmp"),
    { recursive: true, force: true }
  );
} catch {}

section("3. INDEX SCRIPT LOADING ORDER");

const html = read("index.html");

if (!html) {
  fail("index.html could not be read");
} else {

  const scripts = [];

  const regex =
    /<script\b[^>]*?(?:src\s*=\s*["']([^"']+)["'])?[^>]*>/gi;

  let match;

  while ((match = regex.exec(html))) {

    scripts.push({
      src: match[1] || "(inline script)",
      position: match.index
    });

  }

  console.log(
    "Script tags detected:",
    scripts.length
  );

  scripts.forEach(
    (script, index) => {

      console.log(
        `${index + 1}. ${script.src}`
      );

    }
  );

  for (const script of scripts) {

    if (
      script.src &&
      script.src !== "(inline script)" &&
      !script.src.startsWith("http") &&
      !script.src.startsWith("//") &&
      !script.src.startsWith("data:")
    ) {

      const clean =
        script.src.split("?")[0];

      const possible =
        clean.startsWith("/")
          ? clean.slice(1)
          : clean;

      if (exists(possible)) {
        pass(
          `Script source exists: ${script.src}`
        );
      } else {
        warn(
          `Script source referenced but file not found: ${script.src}`
        );
      }

    }

  }

}

section("4. DUPLICATE DOM ID AUDIT");

const ids = new Map();

const idRegex =
  /\bid\s*=\s*["']([^"']+)["']/gi;

let idMatch;

while ((idMatch = idRegex.exec(html))) {

  const id = idMatch[1];

  if (!ids.has(id)) {
    ids.set(id, []);
  }

  ids.get(id).push(
    idMatch.index
  );

}

let duplicateIds = 0;

for (const [id, positions] of ids) {

  if (positions.length > 1) {

    duplicateIds++;

    console.log(
      `⚠ Duplicate ID: ${id} (${positions.length} occurrences)`
    );

  }

}

if (duplicateIds === 0) {
  pass("No duplicate DOM IDs detected");
} else {
  warn(
    `${duplicateIds} duplicate DOM IDs detected`
  );
}

console.log(
  "Unique DOM IDs:",
  ids.size
);

section("5. INLINE EVENT HANDLER AUDIT");

const inlineEvents = [
  "onclick",
  "onsubmit",
  "onchange",
  "oninput",
  "onkeyup",
  "onkeydown",
  "onload",
  "onerror"
];

let totalInlineHandlers = 0;

for (const event of inlineEvents) {

  const count =
    countMatches(
      html,
      new RegExp(
        "\\b" + event + "\\s*=",
        "gi"
      )
    );

  if (count > 0) {

    console.log(
      `${event}: ${count}`
    );

    totalInlineHandlers += count;

  }

}

if (totalInlineHandlers === 0) {

  pass(
    "No inline event handlers detected"
  );

} else {

  warn(
    `${totalInlineHandlers} inline event handlers detected`
  );

  console.log(
    "These are not automatically broken, but they require regression testing."
  );

}

section("6. JAVASCRIPT FUNCTION INVENTORY");

const allJs =
  jsFiles
    .map(read)
    .join("\n");

const functionNames = new Map();

const functionRegex =
  /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;

let fnMatch;

while ((fnMatch = functionRegex.exec(allJs))) {

  const name =
    fnMatch[1];

  if (!functionNames.has(name)) {
    functionNames.set(name, 0);
  }

  functionNames.set(
    name,
    functionNames.get(name) + 1
  );

}

let duplicateFunctions = 0;

for (const [name, count] of functionNames) {

  if (count > 1) {

    duplicateFunctions++;

    console.log(
      `⚠ Duplicate function definition: ${name} (${count})`
    );

  }

}

if (duplicateFunctions === 0) {

  pass(
    "No duplicate named function definitions detected"
  );

} else {

  warn(
    `${duplicateFunctions} duplicate function names detected`
  );

}

section("7. CORE UI ACTION INVENTORY");

const coreActions = [
  "bookRide",
  "requestRide",
  "toggleDriverMode",
  "acceptRide",
  "acceptRealRide",
  "acceptRideRequest",
  "completeRide",
  "completeRealRide",
  "claimReward",
  "connectWallet",
  "calculateFare",
  "calcTotalFare",
  "updateFareBreakdown",
  "updateFareDisplay",
  "haversineKm",
  "getRideDistance",
  "pollForRideRequests",
  "pollOnlineDrivers"
];

for (const action of coreActions) {

  const regex =
    new RegExp(
      "\\b" +
      action.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      ) +
      "\\b",
      "g"
    );

  const count =
    countMatches(
      allJs + html,
      regex
    );

  if (count > 0) {

    console.log(
      `✓ ${action}: ${count} references`
    );

  } else {

    warn(
      `${action}: no references detected`
    );

  }

}

section("8. DOM ACCESS HEALTH");

const domSelectors = new Set();

const domPatterns = [

  /getElementById\s*\(\s*["']([^"']+)["']/g,

  /querySelector\s*\(\s*["']#([^"']+)["']/g,

  /querySelectorAll\s*\(\s*["']#([^"']+)["']/g

];

for (const regex of domPatterns) {

  let match;

  while ((match = regex.exec(allJs))) {

    domSelectors.add(
      match[1]
    );

  }

}

let missingDomTargets = 0;

for (const id of domSelectors) {

  if (!ids.has(id)) {

    missingDomTargets++;

    console.log(
      `⚠ JavaScript references missing DOM ID: #${id}`
    );

  }

}

if (missingDomTargets === 0) {

  pass(
    "All statically detected JavaScript DOM IDs exist in index.html"
  );

} else {

  warn(
    `${missingDomTargets} JavaScript DOM targets may be missing`
  );

}

console.log(
  "DOM IDs referenced by JavaScript:",
  domSelectors.size
);

section("9. NAVIGATION TARGET HEALTH");

const hrefs = new Set();

const hrefRegex =
  /\bhref\s*=\s*["']([^"']+)["']/gi;

let hrefMatch;

while ((hrefMatch = hrefRegex.exec(html))) {

  hrefs.add(
    hrefMatch[1]
  );

}

for (const href of hrefs) {

  if (
    href.startsWith("#")
  ) {

    const target =
      href.slice(1);

    if (!target) {
      continue;
    }

    if (ids.has(target)) {

      pass(
        `Navigation target exists: ${href}`
      );

    } else {

      warn(
        `Navigation target missing: ${href}`
      );

    }

  }

}

section("10. REQUIRED CABLINK UI AREAS");

const requiredAreas = [
  {
    name: "Navbar",
    patterns: ["navbar", "nav"]
  },
  {
    name: "Passenger booking",
    patterns: ["bookRide", "requestRide"]
  },
  {
    name: "Driver mode",
    patterns: ["toggleDriverMode"]
  },
  {
    name: "Driver ride acceptance",
    patterns: ["acceptRide"]
  },
  {
    name: "Ride completion",
    patterns: ["completeRide"]
  },
  {
    name: "Wallet",
    patterns: ["wallet", "connectWallet"]
  },
  {
    name: "THB rewards",
    patterns: ["THB", "THoBoCoin", "claimReward"]
  }
];

for (const area of requiredAreas) {

  const found =
    area.patterns.some(
      pattern =>
        allJs.includes(pattern) ||
        html.includes(pattern)
    );

  if (found) {

    pass(
      `${area.name} references detected`
    );

  } else {

    fail(
      `${area.name} references not detected`
    );

  }

}

section("11. SETTLEMENT UI STATE READINESS");

const states = [
  "PENDING",
  "SUBMITTING",
  "SUBMITTED",
  "CONFIRMED",
  "FAILED",
  "SETTLED",
  "RETRY"
];

for (const state of states) {

  if (
    allJs.includes(state) ||
    html.includes(state)
  ) {

    console.log(
      `✓ ${state} state reference detected`
    );

  } else {

    console.log(
      `◇ ${state} state not yet implemented`
    );

  }

}

section("12. DOUBLE-CLICK / REPEAT ACTION RISK");

const buttonCount =
  countMatches(
    html,
    /<button\b/gi
  );

const disabledCount =
  countMatches(
    html,
    /\bdisabled\b/gi
  );

console.log(
  "Buttons detected:",
  buttonCount
);

console.log(
  "Disabled-state references:",
  disabledCount
);

if (buttonCount > 0 && disabledCount === 0) {

  warn(
    "No disabled-state references detected; settlement actions should later guard against duplicate clicks."
  );

} else {

  pass(
    "Some UI disabled-state support detected"
  );

}

section("13. MOBILE UI HEALTH INDICATORS");

const viewport =
  /name\s*=\s*["']viewport["']/i.test(
    html
  );

if (viewport) {

  pass(
    "Viewport meta tag detected"
  );

} else {

  warn(
    "Viewport meta tag not detected"
  );

}

const responsiveCss =
  /@media\s*\(/i.test(
    read("frontend/css/style.css")
  );

if (responsiveCss) {

  pass(
    "Responsive CSS media queries detected"
  );

} else if (exists("frontend/css/style.css")) {

  warn(
    "No CSS media queries detected"
  );

} else {

  warn(
    "Dedicated frontend stylesheet not found"
  );

}

section("14. RAW ERROR / SECRET EXPOSURE CHECK");

const secretPatterns = [
  /PRIVATE_KEY/gi,
  /process\.env\.[A-Z_]*SECRET[A-Z_]*/gi,
  /process\.env\.[A-Z_]*PASSWORD[A-Z_]*/gi
];

for (const pattern of secretPatterns) {

  const matches =
    countMatches(
      html,
      pattern
    );

  if (matches > 0) {

    fail(
      `Potential secret/environment reference exposed in index.html: ${pattern}`
    );

  }

}

const backendErrorPatterns = [
  "stack",
  "process.env",
  "PRIVATE_KEY",
  "secret",
  "password"
];

let rawErrorRisk = 0;

for (const pattern of backendErrorPatterns) {

  if (
    html.toLowerCase().includes(
      pattern.toLowerCase()
    )
  ) {

    rawErrorRisk++;

  }

}

if (rawErrorRisk === 0) {

  pass(
    "No obvious backend secret/error leakage patterns detected in index.html"
  );

} else {

  warn(
    `${rawErrorRisk} potential raw backend/error exposure indicators require manual review`
  );

}

section("15. UI HEALTH SUMMARY");

console.log(`
Frontend files inspected:
  ${targets.filter(exists).length}/${targets.length}

Unique DOM IDs:
  ${ids.size}

JavaScript DOM selectors:
  ${domSelectors.size}

Missing DOM targets:
  ${missingDomTargets}

Duplicate DOM IDs:
  ${duplicateIds}

Duplicate function names:
  ${duplicateFunctions}

Inline event handlers:
  ${totalInlineHandlers}

Buttons:
  ${buttonCount}

Failures:
  ${failures}

Warnings:
  ${warnings}
`);

section("16. SURGICAL IMPLEMENTATION BOUNDARY");

console.log(`
THIS PASS MUST NOT:

  ✗ Rewrite booking logic
  ✗ Rewrite driver logic
  ✗ Rewrite reward creation
  ✗ Rewrite wallet resolution
  ✗ Activate blockchain transfers
  ✗ Replace the existing navbar
  ✗ Remove existing UI features
  ✗ Create a competing reward system

THIS PASS MAY ONLY:

  ✓ Repair broken UI references
  ✓ Repair missing DOM targets
  ✓ Stabilise event wiring
  ✓ Clean duplicated UI markup where proven safe
  ✓ Add consistent loading indicators
  ✓ Add disabled states to prevent repeated actions
  ✓ Add clean settlement status presentation
  ✓ Improve mobile responsiveness
  ✓ Improve error presentation
  ✓ Preserve all existing functional flows

NEXT IMPLEMENTATION TARGET:

  UI HEALTH + CLEANLINESS ONLY

AFTER THAT:

  Canonical settlement bridge integration
  with NO live transaction during initial testing.
`);

section("17. FINAL DETERMINATION");

if (failures === 0) {

  console.log(`
✓ UI HEALTH AUDIT COMPLETED WITHOUT CRITICAL FAILURES

The existing UI can proceed to a surgical cleanup phase.

IMPORTANT:
Warnings are not automatically bugs.
They identify areas requiring careful treatment.

NO FILES WERE MODIFIED.
NO BLOCKCHAIN TRANSACTION WAS SENT.
NO TOKEN TRANSFER WAS EXECUTED.
`);

} else {

  console.log(`
⚠ UI HEALTH AUDIT FOUND ${failures} CRITICAL FAILURE(S)

These must be reviewed before making UI changes.

NO FILES WERE MODIFIED.
NO BLOCKCHAIN TRANSACTION WAS SENT.
NO TOKEN TRANSFER WAS EXECUTED.
`);

}

console.log(`
================================================================================
STAGE 4G.10 — UI HEALTH AUDIT COMPLETE
================================================================================
`);
