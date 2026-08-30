const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".git", "archive", "dist", "build", ".vercel"]);
const CODE_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);

const ENTRY_POINTS = [
  "backend/server/app.js",
  "backend/server/index.js",
  "api/index.js",
  "frontend/main.jsx",
  "frontend/App.jsx",
  "sw.js"
];

let files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(ROOT);

const codeFiles = files.filter(f => CODE_EXT.has(path.extname(f)));
const htmlFiles = files.filter(f => f.endsWith(".html"));

// Build require/import graph
const refCounts = {};
codeFiles.forEach(f => refCounts[f] = 0);

function resolveImport(fromFile, importPath) {
  if (!importPath.startsWith(".")) return null; // skip node_modules/packages
  let resolved = path.resolve(path.dirname(fromFile), importPath);
  const candidates = [resolved, resolved + ".js", resolved + ".jsx", path.join(resolved, "index.js")];
  return candidates.find(c => fs.existsSync(c)) || null;
}

const requireRe = /require\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
const importRe = /import\s+(?:[^"'`]+\s+from\s+)?["'`]([^"'`]+)["'`]/g;

codeFiles.forEach(f => {
  let content;
  try { content = fs.readFileSync(f, "utf8"); } catch { return; }
  for (const re of [requireRe, importRe]) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(content))) {
      const target = resolveImport(f, m[1]);
      if (target && refCounts.hasOwnProperty(target)) refCounts[target]++;
    }
  }
});

// HTML script src references count too
htmlFiles.forEach(f => {
  let content;
  try { content = fs.readFileSync(f, "utf8"); } catch { return; }
  const srcRe = /<script[^>]+src=["']([^"']+)["']/g;
  let m;
  while ((m = srcRe.exec(content))) {
    const target = path.resolve(path.dirname(f), m[1]);
    if (refCounts.hasOwnProperty(target)) refCounts[target]++;
  }
});

const entryFull = ENTRY_POINTS.map(e => path.resolve(ROOT, e));

// Build report
let report = `# CabLink Full Repo Audit\nGenerated: ${new Date().toISOString()}\n\n`;
report += `Total code files scanned: ${codeFiles.length}\n\n`;

report += `## ORPHAN CANDIDATES (0 inbound references, not an entry point)\n`;
report += `These are never require()'d/imported by anything else in the live tree. Likely dead, duplicate, or legacy.\n\n`;
const orphans = codeFiles.filter(f => refCounts[f] === 0 && !entryFull.includes(f));
orphans.sort().forEach(f => {
  const lines = fs.readFileSync(f, "utf8").split("\n").length;
  report += `- \`${path.relative(ROOT, f)}\` (${lines} lines)\n`;
});

report += `\n## LIVE FILES (referenced at least once)\n\n`;
codeFiles.filter(f => refCounts[f] > 0).sort((a,b) => refCounts[b]-refCounts[a]).forEach(f => {
  const lines = fs.readFileSync(f, "utf8").split("\n").length;
  report += `- \`${path.relative(ROOT, f)}\` — ${refCounts[f]} ref(s), ${lines} lines\n`;
});

report += `\n## ENTRY POINTS CHECKED\n`;
ENTRY_POINTS.forEach(e => {
  const full = path.resolve(ROOT, e);
  report += `- \`${e}\` — ${fs.existsSync(full) ? "found" : "NOT FOUND"}\n`;
});

fs.writeFileSync("audit_report.md", report);
console.log("Wrote audit_report.md");
console.log(`Total files: ${codeFiles.length} | Orphan candidates: ${orphans.length} | Live: ${codeFiles.length - orphans.length - entryFull.filter(e=>fs.existsSync(e)).length}`);
