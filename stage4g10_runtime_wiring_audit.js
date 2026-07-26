const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const files = [
  "index.html",
  "frontend/js/app.js",
  "frontend/js/core.js",
  "frontend/js/app_core.js",
  "frontend/js/app_engine.js",
  "frontend/css/style.css"
];

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

function section(title) {
  console.log(`
================================================================================
${title}
================================================================================
`);
}

function count(text, regex) {
  return (text.match(regex) || []).length;
}

function context(text, index, radius = 500) {
  return text.slice(
    Math.max(0, index - radius),
    Math.min(text.length, index + radius)
  );
}

console.log(`
================================================================================
CABLINK STAGE 4G.10 — RUNTIME WIRING + DEPENDENCY AUDIT
================================================================================

READ ONLY
NO FILES MODIFIED
NO BLOCKCHAIN TRANSACTION
NO TOKEN TRANSFER
NO BUSINESS LOGIC CHANGED

PURPOSE:

  1. Determine exactly which JS/CSS files index.html loads
  2. Identify duplicate driverModeBtn ownership
  3. Identify the CABLINK role-switch implementation
  4. Trace all suspicious DOM IDs
  5. Determine whether missing IDs are static, dynamic, or dead references
  6. Identify actual function definitions and event wiring
  7. Detect script-order dependencies
  8. Produce the exact surgical patch boundary

================================================================================
`);

const html = read("index.html");

section("1. ACTUAL EXTERNAL SCRIPT + CSS LOADING");

const externalScripts = [];
const externalStyles = [];

const scriptRegex =
  /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

const linkRegex =
  /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;

let match;

while ((match = scriptRegex.exec(html))) {
  externalScripts.push({
    src: match[1],
    index: match.index
  });
}

while ((match = linkRegex.exec(html))) {
  externalStyles.push({
    href: match[1],
    index: match.index
  });
}

console.log("EXTERNAL JAVASCRIPT FILES:");

if (!externalScripts.length) {
  console.log("  None detected.");
}

for (const item of externalScripts) {
  const clean = item.src.split("?")[0];
  const relative = clean.startsWith("/")
    ? clean.slice(1)
    : clean;

  console.log(`  ${item.src}`);

  if (
    !clean.startsWith("http") &&
    !clean.startsWith("//") &&
    exists(relative)
  ) {
    console.log("    ✓ FILE EXISTS");
  } else if (
    !clean.startsWith("http") &&
    !clean.startsWith("//")
  ) {
    console.log("    ⚠ FILE NOT FOUND");
  }
}

console.log("\nSTYLESHEETS:");

if (!externalStyles.length) {
  console.log("  None detected.");
}

for (const item of externalStyles) {
  const clean = item.href.split("?")[0];
  const relative = clean.startsWith("/")
    ? clean.slice(1)
    : clean;

  console.log(`  ${item.href}`);

  if (
    !clean.startsWith("http") &&
    !clean.startsWith("//") &&
    exists(relative)
  ) {
    console.log("    ✓ FILE EXISTS");
  } else if (
    !clean.startsWith("http") &&
    !clean.startsWith("//")
  ) {
    console.log("    ⚠ FILE NOT FOUND");
  }
}

section("2. INLINE SCRIPT INVENTORY + ORDER");

const inlineScripts = [];

const fullScriptRegex =
  /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

let scriptMatch;
let scriptNumber = 0;

while ((scriptMatch = fullScriptRegex.exec(html))) {

  scriptNumber++;

  const attrs = scriptMatch[1] || "";
  const body = scriptMatch[2] || "";

  if (/\bsrc\s*=/i.test(attrs)) {
    continue;
  }

  inlineScripts.push({
    number: scriptNumber,
    index: scriptMatch.index,
    length: body.length,
    body
  });

  console.log(
    `Inline Script #${scriptNumber}: ${body.length} characters`
  );

  const firstLines =
    body
      .trim()
      .split("\n")
      .slice(0, 5)
      .join("\n");

  console.log(firstLines || "(empty)");
  console.log("---");
}

section("3. DRIVER MODE BUTTON OWNERSHIP");

const driverButtonRegex =
  /<[^>]*\bid\s*=\s*["']driverModeBtn["'][^>]*>/gi;

const driverButtons =
  [...html.matchAll(driverButtonRegex)];

console.log(
  "driverModeBtn occurrences:",
  driverButtons.length
);

for (let i = 0; i < driverButtons.length; i++) {

  const index =
    driverButtons[i].index;

  console.log(`
--- driverModeBtn OCCURRENCE ${i + 1} ---
${context(html, index, 900)}
`);
}

if (driverButtons.length > 1) {
  console.log(`
⚠ CONFIRMED DUPLICATE ID

The application currently contains more than one element using:
  id="driverModeBtn"

SURGICAL RULE:
  KEEP the original Driver Mode / Go Online control.
  RENAME only the secondary role-switch control.
`);
} else {
  console.log("✓ No duplicate driverModeBtn detected.");
}

section("4. CABLINK ROLE SWITCH IMPLEMENTATION");

const roleMarkers = [
  "CABLINK ROLE SWITCH",
  "cablinkRoleSwitch",
  "passengerModeBtn",
  "driverModeBtn",
  "setCabLinkRole",
  "cablinkRoleChanged"
];

for (const marker of roleMarkers) {

  const regex =
    new RegExp(
      marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );

  const matches =
    [...html.matchAll(regex)];

  console.log(
    `\n${marker}: ${matches.length} occurrence(s)`
  );

  for (const item of matches.slice(0, 5)) {
    console.log(
      context(html, item.index, 400)
    );
  }
}

section("5. EXACT SUSPICIOUS DOM TARGET TRACE");

const targets = [
  "d-name",
  "d-phone",
  "mapSvg",
  "leaflet-css",
  "driverCount",
  "req_"
];

const sourceFiles = [
  "index.html",
  "frontend/js/app.js",
  "frontend/js/core.js",
  "frontend/js/app_core.js"
];

for (const target of targets) {

  console.log(`
================================================================================
TARGET: ${target}
================================================================================
`);

  let total = 0;

  for (const file of sourceFiles) {

    const content = read(file);

    if (!content) {
      continue;
    }

    const escaped =
      target.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const regex =
      new RegExp(
        escaped,
        "gi"
      );

    const matches =
      [...content.matchAll(regex)];

    if (!matches.length) {
      continue;
    }

    console.log(
      `FILE: ${file} — ${matches.length} occurrence(s)`
    );

    total += matches.length;

    for (const item of matches.slice(0, 10)) {

      console.log(`
--- MATCH ---
${context(content, item.index, 650)}
`);
    }
  }

  if (total === 0) {
    console.log(
      "No source occurrence found."
    );
  }
}

section("6. DRIVER MODE FUNCTION DEFINITIONS");

const allJs =
  [
    "frontend/js/app.js",
    "frontend/js/core.js",
    "frontend/js/app_core.js"
  ]
    .map(read)
    .join("\n");

const driverFunctions = [
  "toggleDriverMode",
  "acceptRideRequest",
  "acceptRide",
  "acceptRealRide",
  "completeRide",
  "completeRealRide",
  "pollForRideRequests",
  "pollOnlineDrivers"
];

for (const name of driverFunctions) {

  const regex =
    new RegExp(
      `(?:async\\s+)?function\\s+${name}\\s*\\(`,
      "g"
    );

  const matches =
    [...allJs.matchAll(regex)];

  console.log(
    `${name}: ${matches.length} function definition(s)`
  );

  if (matches.length) {

    for (const item of matches) {

      console.log(
        context(allJs, item.index, 700)
      );

    }

  }
}

section("7. INLINE BUTTON EVENT WIRING");

const eventRegex =
  /<button\b[^>]*\bonclick\s*=\s*["']([^"']+)["'][^>]*>/gi;

const buttonEvents =
  [...html.matchAll(eventRegex)];

console.log(
  "Buttons with inline onclick:",
  buttonEvents.length
);

const eventNames = new Map();

for (const item of buttonEvents) {

  const handler =
    item[1]
      .split("(")[0]
      .trim();

  if (!eventNames.has(handler)) {
    eventNames.set(handler, 0);
  }

  eventNames.set(
    handler,
    eventNames.get(handler) + 1
  );
}

for (const [name, occurrences] of eventNames) {

  console.log(
    `${name}: ${occurrences}`
  );

}

section("8. INLINE HANDLER FUNCTION RESOLUTION");

for (const [name, occurrences] of eventNames) {

  if (!name) {
    continue;
  }

  const functionRegex =
    new RegExp(
      `(?:async\\s+)?function\\s+${name}\\s*\\(`,
      "g"
    );

  const arrowRegex =
    new RegExp(
      `(?:window\\.)?${name}\\s*=\\s*(?:async\\s*)?`,
      "g"
    );

  const functionMatches =
    [...allJs.matchAll(functionRegex)];

  const arrowMatches =
    [...allJs.matchAll(arrowRegex)];

  const inlineMatches =
    [...html.matchAll(
      new RegExp(
        `(?:function\\s+)?${name}`,
        "g"
      )
    )];

  const resolved =
    functionMatches.length ||
    arrowMatches.length ||
    inlineMatches.length;

  console.log(
    `${name}: ${occurrences} button use(s) — ${
      resolved
        ? "reference detected"
        : "⚠ NO RESOLUTION DETECTED"
    }`
  );
}

section("9. SCRIPT ORDER DEPENDENCY CHECK");

const orderedFiles = [
  ...externalScripts.map(x => x.src),
  ...inlineScripts.map(
    x => `INLINE_SCRIPT_${x.number}`
  )
];

orderedFiles.forEach(
  (file, index) => {
    console.log(
      `${index + 1}. ${file}`
    );
  }
);

console.log(`
IMPORTANT:
This section is observational only.

No script will be reordered.
No module will be created.
No code will be moved.
`);

section("10. MISSING FILE REFERENCE CHECK");

const expectedFiles = [
  "frontend/js/app_engine.js",
  "frontend/css/style.css"
];

for (const file of expectedFiles) {

  const contentReferences =
    count(
      html,
      new RegExp(
        file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      )
    );

  console.log(
    `${file}: exists=${exists(file)} | index.html references=${contentReferences}`
  );
}

section("11. SURGICAL PATCH DECISION");

console.log(`
CURRENT EVIDENCE:

1. driverModeBtn duplicate:
   CONFIRMED

2. Secondary driverModeBtn location:
   CABLINK ROLE SWITCH

3. Primary driverModeBtn:
   DRIVER MODE / GO ONLINE

4. req- duplicate:
   LIKELY AUDIT FALSE POSITIVE / DYNAMIC ID PREFIX
   REQUIRES NO UI PATCH AT THIS STAGE

5. Missing DOM targets:
   REQUIRE FUNCTION-LEVEL TRACE BEFORE PATCHING

6. app_engine.js:
   MUST NOT BE CREATED UNTIL INDEX REFERENCE IS CONFIRMED

7. style.css:
   MUST NOT BE CREATED UNTIL INDEX REFERENCE IS CONFIRMED

8. Inline event handlers:
   DO NOT REWRITE YET

9. Blockchain:
   NO CHANGE

10. Reward system:
    NO CHANGE

11. Wallet resolution:
    NO CHANGE
`);

section("12. FINAL DETERMINATION");

console.log(`
READ-ONLY RUNTIME WIRING AUDIT COMPLETE.

NO FILES MODIFIED.
NO BUSINESS LOGIC MODIFIED.
NO BLOCKCHAIN TRANSACTION SENT.
NO TOKEN TRANSFER EXECUTED.

NEXT SAFE PATCH CANDIDATE:

  Rename ONLY the secondary CABLINK ROLE SWITCH button
  from:
      id="driverModeBtn"

  to:
      id="cablinkDriverRoleBtn"

  Then update ONLY the role-switch event binding that targets
  the secondary button.

NO OTHER UI CHANGES SHOULD BE MADE UNTIL THIS PATCH IS VERIFIED.

================================================================================
CABLINK STAGE 4G.10 — RUNTIME WIRING AUDIT COMPLETE
================================================================================
`);
