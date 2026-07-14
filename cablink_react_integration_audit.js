const fs = require("fs");
const path = require("path");

console.log(`
=========================================
🚕 CABLINK REACT INTEGRATION AUDIT
=========================================
`);

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, list);
    } else {
      list.push(full);
    }
  }

  return list;
}

const frontend = walk("frontend");
const backend = walk("backend");

const reactFiles = frontend.filter(f =>
  f.endsWith(".jsx") ||
  f.endsWith(".js")
);

const appCode =
  fs.existsSync("frontend/App.jsx")
    ? fs.readFileSync("frontend/App.jsx","utf8")
    : "";

const report = {
  frontendFiles: frontend.length,
  backendFiles: backend.length,
  activeComponents: [],
  disconnectedComponents: [],
  services: [],
  pages: [],
  backendRoutes: [],
  testingFiles: [],
  legacyScripts: []
};

for (const file of reactFiles) {

  if (file.includes("/components/")) {

    const name = path.basename(file).replace(/\.(jsx|js)$/,"");

    if (
      appCode.includes(name) ||
      appCode.includes("./components/"+name)
    ) {
      report.activeComponents.push(file);
    } else {
      report.disconnectedComponents.push(file);
    }

  }

  if (file.includes("/services/"))
    report.services.push(file);

  if (file.includes("/pages/"))
    report.pages.push(file);

  if (file.includes("/testing/"))
    report.testingFiles.push(file);
}

const server =
fs.existsSync("backend/server.js")
? fs.readFileSync("backend/server.js","utf8")
: "";

const matches =
server.match(/require\("\.\/routes\/(.*?)"\)/g) || [];

matches.forEach(m=>{
  report.backendRoutes.push(
    m.replace('require("./routes/','')
     .replace('")','')
  );
});

const root = fs.readdirSync(".");

root.forEach(f=>{
  if(
    /^cablink_phase/i.test(f) ||
    /^cablink_/i.test(f)
  ){
    report.legacyScripts.push(f);
  }
});

fs.writeFileSync(
"CABLINK_REACT_INTEGRATION_AUDIT.json",
JSON.stringify(report,null,2)
);

console.log("\n========== SUMMARY ==========\n");

console.log("Frontend Files :",report.frontendFiles);
console.log("Backend Files  :",report.backendFiles);
console.log("");

console.log("Active Components      :",report.activeComponents.length);
console.log("Disconnected Components:",report.disconnectedComponents.length);
console.log("Pages                  :",report.pages.length);
console.log("Services               :",report.services.length);
console.log("Backend Routes         :",report.backendRoutes.length);
console.log("Testing Files          :",report.testingFiles.length);
console.log("Legacy Scripts         :",report.legacyScripts.length);

console.log("\nActive Components:");
report.activeComponents.forEach(x=>console.log("  ✓",x));

console.log("\nDisconnected Components:");
report.disconnectedComponents.forEach(x=>console.log("  •",x));

console.log("\nBackend Routes:");
report.backendRoutes.forEach(x=>console.log("  →",x));

console.log(`
=========================================
Audit saved to:

CABLINK_REACT_INTEGRATION_AUDIT.json
=========================================
`);
