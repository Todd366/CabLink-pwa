const fs = require("fs");

const file = "index.html";

if (!fs.existsSync(file)) {
  console.log("❌ index.html not found");
  process.exit(1);
}

const backup = "index_before_role_auto_cleanup.html";
fs.copyFileSync(file, backup);

let html = fs.readFileSync(file, "utf8");

const pattern = /<script\s+src=["']role\.js[^"']*["']><\/script>/g;

const matches = html.match(pattern) || [];

console.log("Found role.js entries:", matches.length);

if (matches.length <= 1) {
  console.log("✅ No duplicate role.js found");
  process.exit(0);
}

// Keep newest entry
const keep = matches[matches.length - 1];

html = html.replace(pattern, "");

html += "\n" + keep + "\n";

fs.writeFileSync(file, html);

console.log("✅ Duplicate role.js removed");
console.log("✅ Kept:", keep);
console.log("✅ Backup:", backup);
