// Fails when a file declares the same top-level function/const/let/class twice (the later one silently wins).
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DIRS = ["app/js", "backend", "api", "scripts"];
const SKIP = new Set(["node_modules", "archive", ".git"]);
function walk(d, out) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (SKIP.has(e.name)) continue;
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p, out); else if (/\.(js|mjs)$/.test(e.name)) out.push(p);
    }
    return out;
}
const found = [];
for (const dir of DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of walk(abs, [])) {
        const seen = new Map();
        fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
            const m = line.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?\s+([A-Za-z_$][\w$]*)|(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)\b)/);
            const name = m && (m[1] || m[2]);
            if (!name) return;
            if (seen.has(name)) found.push(path.relative(ROOT, f) + ": '" + name + "' declared at lines " + seen.get(name) + " and " + (i + 1));
            else seen.set(name, i + 1);
        });
    }
}
if (require.main === module) {
    if (found.length) { console.error("DUPLICATE DECLARATIONS:\n" + found.join("\n")); process.exit(1); }
    console.log("no duplicate top-level declarations");
}
module.exports = { found };
