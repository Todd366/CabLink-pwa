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

const idxPath = path.join('frontend', 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
html = replaceOnce(html, "const clAccountRaw = localStorage.getItem('cl_account');\nconst clAccount = clAccountRaw ? JSON.parse(clAccountRaw) : null;\n\nlet driver={\n\nid:\n(clAccount && clAccount.id) ||\nlocalStorage.getItem(\"cablink_driver_id\")\n||\n\"DRV-\"+Date.now(),\n\nname:\n(clAccount && clAccount.name) ||\n\"CabLink Driver\",\n\nlocation:\n\"Gaborone\",\n\ntimestamp:\nDate.now()\n\n};", "const clAccountRaw = localStorage.getItem('cl_account');\nconst clAccount = clAccountRaw ? JSON.parse(clAccountRaw) : null;\n\nlet coords = {};\nif(navigator.geolocation){\n  coords = await new Promise((resolve) => {\n    navigator.geolocation.getCurrentPosition(\n      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),\n      () => { toast('Could not get GPS location — using default area', 'warning'); resolve({}); },\n      { timeout: 8000 }\n    );\n  });\n}\n\nlet driver={\n\nid:\n(clAccount && clAccount.id) ||\nlocalStorage.getItem(\"cablink_driver_id\")\n||\n\"DRV-\"+Date.now(),\n\nname:\n(clAccount && clAccount.name) ||\n\"CabLink Driver\",\n\nlocation:\n\"Gaborone\",\n\nlat:\ncoords.lat || null,\n\nlng:\ncoords.lng || null,\n\ntimestamp:\nDate.now()\n\n};", 'real GPS on driver go-online');
fs.writeFileSync(idxPath, html, 'utf8');
console.log('✅ frontend/index.html: real GPS wired into go-online');

const apiPath = path.join('backend', 'routes', 'driver_online_api.js');
let api = fs.readFileSync(apiPath, 'utf8');
api = replaceOnce(api, "router.post(\n\"/drivers/online\",\n(req,res)=>{\n\nlet driver=req.body;\n\n\nif(!driver.id){\n\ndriver.id=\n\"DRV-\"+Date.now();\n\n}\n\n\ndriver.status=\"ONLINE\";\n\n\nonlineDrivers.push(driver);\n\n\nres.json({\n\nsuccess:true,\n\ndriver\n\n});\n\n\n});", "router.post(\n\"/drivers/online\",\n(req,res)=>{\n\nlet driver=req.body;\n\n\nif(!driver.id){\n\ndriver.id=\n\"DRV-\"+Date.now();\n\n}\n\n\ndriver.status=\"ONLINE\";\n\n// Replace any existing entry for this driver instead of\n// pushing a duplicate — otherwise going online repeatedly\n// without going offline first fills the list with copies\n// of the same driver.\nonlineDrivers=\nonlineDrivers.filter(\nd=>d.id!==driver.id\n);\n\nonlineDrivers.push(driver);\n\n\nres.json({\n\nsuccess:true,\n\ndriver\n\n});\n\n\n});", 'dedupe online drivers by id');
fs.writeFileSync(apiPath, api, 'utf8');
console.log('✅ backend/routes/driver_online_api.js: duplicate-driver-entry bug fixed');

console.log('');
console.log('Done. Restart backend: Ctrl+C then npm run backend');
