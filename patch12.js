// ============================================================
// PATCH 12 — PERSISTENT DRIVER REGISTRY
// ============================================================
//
// Fixes a real production bug found by direct code inspection:
// backend/routes/driver_online_api.js was holding online drivers
// in a plain in-memory array (`let onlineDrivers = []`). On a
// long-running Termux/local process that is fine — but on Vercel,
// every serverless cold start gets a fresh process, so that array
// resets to empty. Online drivers could vanish from ride matching
// at any moment in production with zero warning.
//
// This patch:
// 1. Adds backend/services/driver_registry_service.js — a
//    persistent LOCAL/FIRESTORE dual-mode store, matching the
//    exact pattern already used for rides in
//    backend/canonical/ride_persistence.js.
// 2. Rewrites backend/routes/driver_online_api.js to use it
//    instead of the in-memory array. Same endpoints, same
//    request/response shape — nothing on the frontend needs to
//    change.
//
// Mode defaults to LOCAL (backend/data/drivers_online.json).
// Set CABLINK_DRIVER_PERSISTENCE=FIRESTORE in your Vercel env
// vars when ready, same as you already do for
// CABLINK_RIDE_PERSISTENCE.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

function writeFile(relPath, content, label) {
    const full = p(relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    console.log("wrote " + relPath + " (" + label + ")");
}


writeFile(
    "backend/services/driver_registry_service.js",
    "// ============================================================\n// CABLINK PERSISTENT DRIVER REGISTRY\n// ============================================================\n//\n// Replaces the old in-memory `onlineDrivers = []` array that\n// used to live directly inside backend/routes/driver_online_api.js.\n//\n// That array was fine on a single long-running Termux/local\n// process, but on Vercel's serverless model every cold start\n// gets a fresh process — so the entire online-driver list (and\n// therefore ride matching) could silently reset to empty at any\n// moment in production. This mirrors the exact dual-mode\n// LOCAL/FIRESTORE pattern already established in\n// backend/canonical/ride_persistence.js so the whole backend\n// stays on one consistent persistence approach.\n//\n// Mode is controlled by CABLINK_DRIVER_PERSISTENCE (defaults to\n// LOCAL, same convention as CABLINK_RIDE_PERSISTENCE). Set it to\n// FIRESTORE in Vercel's environment variables before relying on\n// this in production, exactly like the ride store.\n// ============================================================\n\nconst fs = require(\"fs\");\nconst path = require(\"path\");\n\nconst MODE = process.env.CABLINK_DRIVER_PERSISTENCE || \"LOCAL\";\n\nconst DATA_DIR = path.join(__dirname, \"..\", \"data\");\nconst FILE = path.join(DATA_DIR, \"drivers_online.json\");\n\nconst COLLECTION =\n    process.env.CABLINK_DRIVER_FIRESTORE_COLLECTION || \"cablink_online_drivers\";\n\nlet firestore = null;\n\nfunction getFirestoreAdapter() {\n    if (!firestore) {\n        firestore = require(\"../firebase/firestore_adapter\");\n    }\n    return firestore;\n}\n\n// ------------------------------------------------------------\n// LOCAL STORAGE\n// ------------------------------------------------------------\n\nfunction ensureLocalStore() {\n    try {\n        fs.mkdirSync(DATA_DIR, { recursive: true });\n    } catch (_) {}\n\n    if (!fs.existsSync(FILE)) {\n        try {\n            fs.writeFileSync(FILE, \"[]\", \"utf8\");\n        } catch (_) {}\n    }\n}\n\nfunction loadLocal() {\n    ensureLocalStore();\n    try {\n        const raw = fs.readFileSync(FILE, \"utf8\");\n        const data = JSON.parse(raw);\n        return Array.isArray(data) ? data : [];\n    } catch (error) {\n        console.error(\"Driver registry local read error:\", error);\n        return [];\n    }\n}\n\nfunction saveLocal(drivers) {\n    ensureLocalStore();\n    try {\n        fs.writeFileSync(FILE, JSON.stringify(drivers, null, 2), \"utf8\");\n        return true;\n    } catch (error) {\n        console.error(\"Driver registry local write error:\", error);\n        return false;\n    }\n}\n\n// ------------------------------------------------------------\n// GO ONLINE (create or replace this driver's entry)\n// ------------------------------------------------------------\n\nasync function goOnline(driver) {\n    if (!driver.id) {\n        // Defensive fallback only — the real app already sends the\n        // logged-in account id (see CABLINK_DRIVER_REALITY_PATCH in\n        // frontend/index.html). This branch just stops a malformed\n        // request from crashing the endpoint.\n        driver.id = \"DRV-\" + Date.now();\n    }\n\n    const record = {\n        ...driver,\n        id: String(driver.id),\n        status: \"ONLINE\",\n        updatedAt: new Date().toISOString()\n    };\n\n    if (MODE === \"FIRESTORE\") {\n        const db = getFirestoreAdapter();\n        await db.write(COLLECTION, record.id, record);\n        return record;\n    }\n\n    const drivers = loadLocal().filter(d => d.id !== record.id);\n    drivers.push(record);\n    saveLocal(drivers);\n    return record;\n}\n\n// ------------------------------------------------------------\n// GO OFFLINE (remove this driver's entry)\n// ------------------------------------------------------------\n\nasync function goOffline(id) {\n    const driverId = String(id);\n\n    if (MODE === \"FIRESTORE\") {\n        const db = getFirestoreAdapter();\n        await db.delete(COLLECTION, driverId);\n        return true;\n    }\n\n    const drivers = loadLocal().filter(d => d.id !== driverId);\n    saveLocal(drivers);\n    return true;\n}\n\n// ------------------------------------------------------------\n// LIST ALL ONLINE DRIVERS\n// ------------------------------------------------------------\n\nasync function all() {\n    if (MODE === \"FIRESTORE\") {\n        const db = getFirestoreAdapter();\n        return db.list(COLLECTION);\n    }\n\n    return loadLocal();\n}\n\n// ------------------------------------------------------------\n// STATUS (for health checks / debugging, matches ride_persistence.status())\n// ------------------------------------------------------------\n\nfunction status() {\n    return {\n        mode: MODE,\n        provider: MODE === \"FIRESTORE\" ? \"FIRESTORE\" : \"LOCAL\",\n        file: FILE,\n        collection: COLLECTION\n    };\n}\n\nmodule.exports = {\n    goOnline,\n    goOffline,\n    all,\n    status\n};\n",
    "new persistent driver registry"
);

writeFile(
    "backend/routes/driver_online_api.js",
    "// =========================================\n// CABLINK DRIVER ONLINE API\n// =========================================\n//\n// PATCH 12: rewired onto the persistent driver registry\n// (backend/services/driver_registry_service.js) instead of a\n// plain in-memory array. The array approach lost every online\n// driver on each Vercel serverless cold start, which meant ride\n// matching could silently see zero drivers in production even\n// with real drivers logged in and online. See\n// driver_registry_service.js for the LOCAL/FIRESTORE dual-mode\n// persistence this now goes through.\n// =========================================\n\nconst express = require(\"express\");\nconst router = express.Router();\n\nconst registry = require(\"../services/driver_registry_service\");\n\n// GET ONLINE DRIVERS\n\nrouter.get(\"/drivers/online\", async (req, res) => {\n    try {\n        const drivers = await registry.all();\n        res.json(drivers);\n    } catch (error) {\n        res.status(500).json({ success: false, error: error.message });\n    }\n});\n\n// DRIVER GO ONLINE\n\nrouter.post(\"/drivers/online\", async (req, res) => {\n    try {\n        const driver = await registry.goOnline(req.body || {});\n        res.json({ success: true, driver });\n    } catch (error) {\n        res.status(500).json({ success: false, error: error.message });\n    }\n});\n\n// DRIVER GO OFFLINE\n\nrouter.post(\"/drivers/offline\", async (req, res) => {\n    try {\n        const id = req.body && req.body.id;\n\n        if (!id) {\n            return res.status(400).json({ success: false, error: \"id is required\" });\n        }\n\n        await registry.goOffline(id);\n        res.json({ success: true });\n    } catch (error) {\n        res.status(500).json({ success: false, error: error.message });\n    }\n});\n\nmodule.exports = router;\n",
    "rewired onto persistent registry"
);

const { execSync } = require("child_process");

function syntaxCheck(relPath) {
    try {
        execSync("node -c " + JSON.stringify(p(relPath)), { stdio: "pipe" });
        console.log("syntax OK: " + relPath);
        return true;
    } catch (error) {
        console.log("SYNTAX ERROR in " + relPath);
        console.log(error.stderr ? error.stderr.toString() : error.message);
        return false;
    }
}

const ok =
    syntaxCheck("backend/services/driver_registry_service.js") &&
    syntaxCheck("backend/routes/driver_online_api.js");

console.log("");
if (ok) {
    console.log("Patch 12 complete — driver registry is now persistent.");
    console.log("Restart the server (or redeploy) and drivers going online");
    console.log("will survive process restarts / cold starts instead of");
    console.log("silently disappearing from matching.");
} else {
    console.log("Patch 12 wrote files but a syntax check failed — review");
    console.log("the file(s) flagged above before deploying.");
}
