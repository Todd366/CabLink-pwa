const fs = require('fs');
const path = require('path');

function replaceOnce(content, oldStr, newStr, label) {
  const idx = content.indexOf(oldStr);
  if (idx === -1) {
    console.error('❌ Could not find anchor for: ' + label);
    return content;
  }
  return content.slice(0, idx) + newStr + content.slice(idx + oldStr.length);
}

const appPath = path.join('backend', 'server', 'app.js');
let appJs = fs.readFileSync(appPath, 'utf8');
appJs = replaceOnce(appJs, "const driverApplicationRoutes =\n    require(\"../routes/driver_applications_api\");", "const driverApplicationRoutes =\n    require(\"../routes/driver_applications_api\");\n\nconst leaderboardRoutes =\n    require(\"../routes/leaderboard_api\");", 'app.js require');
appJs = replaceOnce(appJs, "app.use(\n    \"/api\",\n    driverApplicationRoutes\n);", "app.use(\n    \"/api\",\n    driverApplicationRoutes\n);\n\napp.use(\n    \"/api\",\n    leaderboardRoutes\n);", 'app.js mount');
fs.writeFileSync(appPath, appJs, 'utf8');
console.log('✅ backend/server/app.js patched');

fs.writeFileSync(
  path.join('backend', 'routes', 'leaderboard_api.js'),
  "const router = require(\"express\").Router();\nconst fs = require(\"fs\");\nconst path = require(\"path\");\n\nconst LEDGER_FILE = path.join(__dirname, \"..\", \"data\", \"economy_ledger.json\");\nconst ACCOUNTS_FILE = path.join(__dirname, \"..\", \"data\", \"accounts.json\");\n\nfunction loadJson(file, fallback) {\n    if (!fs.existsSync(file)) return fallback;\n    try {\n        return JSON.parse(fs.readFileSync(file, \"utf8\"));\n    } catch (error) {\n        return fallback;\n    }\n}\n\n// GET /api/leaderboard\n// Computed from real completed-ride reward transactions, joined\n// against real accounts for display names. Previously this was\n// five hardcoded names with made-up numbers.\nrouter.get(\"/leaderboard\", (req, res) => {\n    const ledger = loadJson(LEDGER_FILE, { transactions: [] });\n    const accountsData = loadJson(ACCOUNTS_FILE, { accounts: [] });\n\n    const byDriver = {};\n\n    for (const tx of ledger.transactions || []) {\n        if (!tx || tx.type !== \"THB_REWARD\" || !tx.driverId) continue;\n\n        if (!byDriver[tx.driverId]) {\n            byDriver[tx.driverId] = { driverId: tx.driverId, rides: 0, thb: 0 };\n        }\n\n        byDriver[tx.driverId].rides += 1;\n        byDriver[tx.driverId].thb += Number(tx.amount) || 0;\n    }\n\n    const leaderboard = Object.values(byDriver)\n        .map(entry => {\n            const account = (accountsData.accounts || []).find(a => a.id === entry.driverId);\n            return {\n                name: account ? account.name : (entry.driverId.length > 10\n                    ? entry.driverId.slice(0, 8) + \"\u2026\"\n                    : entry.driverId),\n                driverId: entry.driverId,\n                rides: entry.rides,\n                thb: Math.round(entry.thb * 10) / 10\n            };\n        })\n        .sort((a, b) => b.thb - a.thb)\n        .slice(0, 20);\n\n    res.json({ success: true, leaderboard });\n});\n\nmodule.exports = router;\n",
  'utf8'
);
console.log('✅ backend/routes/leaderboard_api.js written');

const idxPath = path.join('frontend', 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
html = replaceOnce(html, "function renderLeaderboard(){\n  const lb = [\n    {name:'Thobo A.', rides:STATE.totalRides+12, thb:STATE.totalEarned+15.5, you:true},\n    {name:'Keabetswe M.', rides:34, thb:38.2}, {name:'Oratile D.', rides:28, thb:31.0},\n    {name:'Mpho S.', rides:21, thb:24.5}, {name:'Lesego T.', rides:18, thb:20.1},\n  ].sort((a,b)=>b.thb-a.thb);\n  const medals=['gold','silver','bronze'];\n  const el = document.getElementById('leaderboard'); if(!el) return;\n  el.innerHTML = lb.map((u,i)=>`\n    <div class=\"lb-row ${u.you?'lb-you':''}\"><span class=\"lb-rank ${medals[i]||''}\">${i+1}</span>\n      <div class=\"lb-info\"><div class=\"lb-name\">${u.name}${u.you?' 👈 You':''}</div><div class=\"lb-rides\">${u.rides} rides</div></div>\n      <span class=\"lb-thb\">${u.thb.toFixed(1)} THB</span></div>`).join('');\n}", "function renderLeaderboard(){\n  const el = document.getElementById('leaderboard'); if(!el) return;\n  el.innerHTML = '<div style=\"padding:12px;color:var(--muted)\">Loading leaderboard…</div>';\n\n  fetch('/api/leaderboard')\n    .then(r => r.json())\n    .then(data => {\n      const lb = (data.leaderboard || []);\n      const myAccount = JSON.parse(localStorage.getItem('cl_account') || 'null');\n\n      if(lb.length === 0){\n        el.innerHTML = '<div style=\"padding:12px;color:var(--muted)\">No completed rides yet — be the first on the board.</div>';\n        return;\n      }\n\n      const medals = ['gold','silver','bronze'];\n      el.innerHTML = lb.map((u,i) => {\n        const isYou = myAccount && u.driverId === myAccount.id;\n        return `\n    <div class=\"lb-row ${isYou?'lb-you':''}\"><span class=\"lb-rank ${medals[i]||''}\">${i+1}</span>\n      <div class=\"lb-info\"><div class=\"lb-name\">${u.name}${isYou?' 👈 You':''}</div><div class=\"lb-rides\">${u.rides} rides</div></div>\n      <span class=\"lb-thb\">${u.thb.toFixed(1)} THB</span></div>`;\n      }).join('');\n    })\n    .catch(() => {\n      el.innerHTML = '<div style=\"padding:12px;color:var(--muted)\">Could not load leaderboard — check your connection.</div>';\n    });\n}\n", 'index.html leaderboard');
fs.writeFileSync(idxPath, html, 'utf8');
console.log('✅ frontend/index.html leaderboard patched');

console.log('');
console.log('Done. Restart backend: Ctrl+C then npm run backend');
