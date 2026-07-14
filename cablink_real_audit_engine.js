const fs = require("fs");
const path = require("path");

console.log(`
=========================================
🔍 CABLINK REAL AUDIT — NO FAKE FLAGS
=========================================
`);

const findings = [];
const pass = (name, detail) => findings.push({name, ok:true, detail});
const fail = (name, detail) => findings.push({name, ok:false, detail});

// 1. Detect self-certifying fake scripts
const root = fs.readdirSync(".");
const suspiciousFiles = root.filter(f =>
  /certification|readiness|gate/i.test(f) && f.endsWith(".js")
);
suspiciousFiles.forEach(f => {
  const code = fs.readFileSync(f, "utf8");
  const hardcodedTrue = (code.match(/=\s*true;/g) || []).length;
  const hasCondition = /require\(|await |\.then\(|assert|===/.test(code);
  if (hardcodedTrue > 3 && !code.includes("require(\"../")) {
    fail("FAKE CERT: " + f, `${hardcodedTrue} hardcoded true flags, no real calls to app code`);
  } else {
    pass("cert script ok: " + f, "looks like it calls real code");
  }
});

// 2. Actually exercise the ride/fare/matching/reward engines
function tryReal(name, fn) {
  try {
    const r = fn();
    pass(name, JSON.stringify(r));
  } catch (e) {
    fail(name, e.message);
  }
}

tryReal("ride_engine real call", () => {
  const ride = require("./backend/rides/ride_engine");
  const r = ride.requestRide({passenger:"TEST", pickup:"A", destination:"B"});
  if (!r.id) throw new Error("no ride id returned");
  return r;
});

tryReal("fare_engine real call", () => {
  const fare = require("./backend/fare/fare_engine");
  const amt = fare.calculate(5, 10);
  if (typeof amt !== "number" || amt <= 0) throw new Error("bad fare output");
  return amt;
});

tryReal("matching_engine real call", () => {
  const match = require("./backend/matching/matching_engine");
  const d = match.findDriver([{id:"D1",online:true,distance:1}], "P1");
  if (!d) throw new Error("no driver matched");
  return d;
});

tryReal("payment_engine real call", () => {
  const pay = require("./backend/payments/payment_engine");
  const p = pay.createPayment({ride:"R1", amount:50});
  if (!p.id) throw new Error("no payment id");
  return p;
});

tryReal("auth_engine real call", () => {
  const auth = require("./backend/auth/auth_engine");
  const u = auth.register({role:"passenger", name:"Test"});
  const back = auth.login(u.id);
  if (!back) throw new Error("login lookup failed after register");
  return back;
});

// 3. Check for actual payment gateway / bank rails (vs just in-memory arrays)
const paymentCode = fs.existsSync("backend/payments/payment_engine.js")
  ? fs.readFileSync("backend/payments/payment_engine.js","utf8") : "";
if (/stripe|flutterwave|paystack|orange money|myzaka|dpo|paygate/i.test(paymentCode)) {
  pass("real payment rail", "external gateway referenced");
} else {
  fail("real payment rail", "payment_engine only pushes to an in-memory array — no real money moves, no persistence, resets on restart");
}

// 4. Check persistence (does data survive a restart?)
const dbFile = "database/production/database.json";
if (fs.existsSync(dbFile)) {
  const db = JSON.parse(fs.readFileSync(dbFile,"utf8"));
  const allEmpty = Object.values(db).every(a => Array.isArray(a) && a.length === 0);
  if (allEmpty) fail("database has real data", "production database.json exists but is empty — nothing has actually been written through the app");
  else pass("database has real data", "non-empty records found");
} else {
  fail("database exists", "no production database file");
}

// 5. Check THB / blockchain wiring is real, not simulated
const ridesDir = "frontend/js";
let onchain = false;
if (fs.existsSync(ridesDir)) {
  const files = fs.readdirSync(ridesDir).filter(f=>f.endsWith(".js"));
  for (const f of files) {
    const c = fs.readFileSync(path.join(ridesDir,f),"utf8");
    if (/ethers|BrowserProvider|Contract\(/i.test(c)) onchain = true;
  }
}
if (onchain) pass("THB on-chain call present", "ethers/Contract usage found in frontend");
else fail("THB on-chain call present", "reward_engine.js just returns a fake object {token:'THB',amount:1,status:'ISSUED'} — no actual transfer() call to the BEP-20 contract");

// 6. Env/secrets check
const envRisk = root.some(f => f === ".env") &&
  fs.readFileSync(".env","utf8").length > 0;
if (fs.existsSync(".gitignore") && fs.readFileSync(".gitignore","utf8").includes(".env")) {
  pass(".env ignored by git", "safe");
} else {
  fail(".env ignored by git", "check that private keys / API keys aren't committed");
}

// 7. Backup file clutter (not fatal, but flag)
const bakCount = root.filter(f => /\.bak$|backup/i.test(f)).length;
if (bakCount > 5) fail("repo cleanliness", `${bakCount} backup/bak files in root — risk of stale code being loaded by mistake`);

// REPORT
console.log("\n--- RESULTS ---\n");
findings.forEach(f => {
  console.log((f.ok ? "✅" : "❌"), f.name, "-", f.detail);
});

const total = findings.length;
const okCount = findings.filter(f=>f.ok).length;
const score = Math.round(okCount/total*100);

console.log(`
=========================================
REAL SCORE: ${score}% (${okCount}/${total} genuine checks passed)
${score < 80 ? "🚧 NOT ready for real-money human pilot tomorrow" : "Closer, but review each ❌ above manually"}
=========================================
`);

fs.writeFileSync("CABLINK_REAL_AUDIT_REPORT.json", JSON.stringify({findings, score}, null, 2));
