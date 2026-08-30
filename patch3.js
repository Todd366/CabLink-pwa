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
html = replaceOnce(html, "  const payload = {\n    pickup, dropoff,\n    fare: STATE.selectedFare || 0,\n    type: STATE.selectedRideType || 'standard',\n    timestamp: Date.now()\n  };", "  const clAccountRaw = localStorage.getItem('cl_account');\n  const clAccount = clAccountRaw ? JSON.parse(clAccountRaw) : null;\n\n  const payload = {\n    pickup, dropoff,\n    fare: STATE.selectedFare || 0,\n    type: STATE.selectedRideType || 'standard',\n    timestamp: Date.now(),\n    passengerId: (clAccount && clAccount.id) || STATE.anonPassengerId || (STATE.anonPassengerId = 'ANON-' + Date.now()),\n    passengerName: (clAccount && clAccount.name) || 'Passenger'\n  };\n  payload.passenger = payload.passengerId; // canonical backend field name", 'passenger identity on booking');
html = replaceOnce(html, "btn.className=\n\"btn btn-sm btn-danger\";\n\n\nlet driver={\n\nid:\nlocalStorage.getItem(\"cablink_driver_id\")\n||\n\"DRV-\"+Date.now(),\n\nname:\n\"CabLink Driver\",\n\nlocation:\n\"Gaborone\",\n\ntimestamp:\nDate.now()\n\n};\n\n\nlocalStorage.setItem(\n\"cablink_driver_id\",\ndriver.id\n);\n\nSTATE.driverId = driver.id;", "btn.className=\n\"btn btn-sm btn-danger\";\n\n\nconst clAccountRaw = localStorage.getItem('cl_account');\nconst clAccount = clAccountRaw ? JSON.parse(clAccountRaw) : null;\n\nlet driver={\n\nid:\n(clAccount && clAccount.id) ||\nlocalStorage.getItem(\"cablink_driver_id\")\n||\n\"DRV-\"+Date.now(),\n\nname:\n(clAccount && clAccount.name) ||\n\"CabLink Driver\",\n\nlocation:\n\"Gaborone\",\n\ntimestamp:\nDate.now()\n\n};\n\nif(!clAccount){\ntoast('Log in on the Profile tab so your rides and THB track to your real account', 'warning');\n}\n\n\nlocalStorage.setItem(\n\"cablink_driver_id\",\ndriver.id\n);\n\nSTATE.driverId = driver.id;", 'driver identity on go-online');
fs.writeFileSync(idxPath, html, 'utf8');
console.log('✅ frontend/index.html identity-wired');

const enginePath = path.join('backend', 'canonical', 'ride_engine.js');
let engine = fs.readFileSync(enginePath, 'utf8');
engine = replaceOnce(engine, "        passenger:\n            data.passenger ||\n            null,\n\n        driverId:", "        passenger:\n            data.passenger ||\n            null,\n\n        passengerName:\n            data.passengerName ||\n            null,\n\n        driverId:", 'passengerName field in ride_engine.js');
fs.writeFileSync(enginePath, engine, 'utf8');
console.log('✅ backend/canonical/ride_engine.js patched');

console.log('');
console.log('Done. Restart backend: Ctrl+C then npm run backend');
