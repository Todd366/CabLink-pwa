// ============================================================
// PATCH 15 — OUTBOUND MARKETPLACE WEBHOOK
// ============================================================
//
// Digital Mall could already hand CabLink a delivery task
// (POST /api/marketplace/tasks) and poll its status
// (GET /api/marketplace/tasks/:id/status) — but CabLink never
// told Digital Mall anything back. This adds the missing half:
// the moment ANY ride reaches COMPLETED through
// ride_engine.js's transition() — the one real chokepoint every
// completion path (both dedicated completion routes AND the
// generic PATCH /:id / PATCH /:id/state routes) funnels through
// — CabLink now notifies Digital Mall's backend, but ONLY for
// rides originally created via the marketplace integration
// (source === "digital_mall"). Normal passenger rides are
// completely unaffected.
//
// New env var to set in Vercel:
//
//   MARKETPLACE_WEBHOOK_URL — Digital Mall's endpoint to receive
//                             completion notifications
//
// If unset, this is a safe no-op (logged once) — the existing
// polling-based status check still works fine without it.
//
// Tested: fires with the correct payload + auth header for a
// digital_mall ride, does NOT fire for a normal passenger ride,
// and a simulated network failure is swallowed rather than
// thrown — a Digital Mall outage can never break a real riders
// completion.
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

function patchExactText(relPath, oldStr, newStr, label) {
    const full = p(relPath);
    const content = fs.readFileSync(full, "utf8");
    const occurrences = content.split(oldStr).length - 1;

    if (occurrences !== 1) {
        console.log("ABORT: expected exactly 1 match in " + relPath + " for \"" + label + "\", found " + occurrences + ". Not touching this file — check it manually.");
        process.exitCode = 1;
        return;
    }

    fs.writeFileSync(full, content.replace(oldStr, newStr), "utf8");
    console.log("patched " + relPath + " (" + label + ")");
}


writeFile(
    "backend/services/marketplace_webhook_service.js",
    "// ============================================================\n// MARKETPLACE WEBHOOK SERVICE\n//\n// Outbound half of the Digital Mall integration. marketplace_api.js\n// already lets Digital Mall hand CabLink a task (POST /api/marketplace/tasks)\n// and poll its status (GET /api/marketplace/tasks/:id/status) — but\n// until now CabLink never told Digital Mall anything back. This\n// notifies Digital Mall's own backend the moment a marketplace-\n// sourced ride reaches COMPLETED, so it doesn't have to poll forever.\n//\n// Config (set in Vercel env vars):\n//\n//   MARKETPLACE_WEBHOOK_URL — Digital Mall's endpoint that receives\n//                             completion notifications. If unset,\n//                             this is a no-op (logs once, does\n//                             nothing) rather than an error — the\n//                             marketplace integration already works\n//                             fine via polling without this.\n//\n// Reuses MARKETPLACE_API_KEY (already configured for inbound auth)\n// as the outbound shared secret too, sent as x-marketplace-key —\n// same header name Digital Mall already sends to CabLink, just in\n// the other direction.\n//\n// IMPORTANT: this must never be allowed to break a real ride\n// completion just because Digital Mall's server is slow, down, or\n// misconfigured. Every failure is caught and logged, never thrown.\n// ============================================================\n\nconst WEBHOOK_URL = process.env.MARKETPLACE_WEBHOOK_URL || \"\";\nconst MARKETPLACE_API_KEY = process.env.MARKETPLACE_API_KEY || \"\";\n\nlet warnedOnce = false;\n\nasync function notifyTaskCompleted(ride) {\n    if (!ride || ride.source !== \"digital_mall\") {\n        // Not a marketplace-sourced ride — nothing to notify.\n        return;\n    }\n\n    if (!WEBHOOK_URL) {\n        if (!warnedOnce) {\n            console.warn(\n                \"⚠️ MARKETPLACE_WEBHOOK_URL not set — Digital Mall will not be \" +\n                \"notified of completed tasks (they can still poll \" +\n                \"/api/marketplace/tasks/:id/status).\"\n            );\n            warnedOnce = true;\n        }\n        return;\n    }\n\n    try {\n        const response = await fetch(WEBHOOK_URL, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\",\n                \"x-marketplace-key\": MARKETPLACE_API_KEY\n            },\n            body: JSON.stringify({\n                taskId: ride.id,\n                externalRef: ride.externalRef || null,\n                status: ride.status,\n                driverName: ride.driverName || null,\n                completedAt: ride.completedAt || null\n            })\n        });\n\n        if (!response.ok) {\n            console.error(\n                \"❌ Marketplace webhook responded with \" + response.status +\n                \" for task \" + ride.id\n            );\n        }\n    } catch (error) {\n        // Never let a Digital Mall outage affect a real ride's\n        // completion response.\n        console.error(\"❌ Marketplace webhook delivery failed:\", error.message);\n    }\n}\n\nmodule.exports = {\n    notifyTaskCompleted\n};\n",
    "new: fire-and-forget completion notifier for Digital Mall"
);

patchExactText(
    "backend/canonical/ride_engine.js",
    "const push =\n    require(\"../services/push_service\");\n",
    "const push =\n    require(\"../services/push_service\");\n\nconst marketplaceWebhook =\n    require(\"../services/marketplace_webhook_service\");\n",
    "add marketplaceWebhook require"
);

if (process.exitCode !== 1) {
    patchExactText(
        "backend/canonical/ride_engine.js",
        "    const updated =\n        await repository.update(\n            id,\n            changes\n        );\n\n    return {\n\n        success:\n            Boolean(\n                updated\n            ),\n\n        ride:\n            updated\n\n    };\n\n}",
        "    const updated =\n        await repository.update(\n            id,\n            changes\n        );\n\n    if (\n        updated &&\n        nextState === STATES.COMPLETED\n    ) {\n        // Fire-and-forget: never let a Digital Mall outage affect\n        // a real riders completion response. See\n        // marketplace_webhook_service.js for details.\n        marketplaceWebhook\n            .notifyTaskCompleted(updated)\n            .catch(() => {});\n    }\n\n    return {\n\n        success:\n            Boolean(\n                updated\n            ),\n\n        ride:\n            updated\n\n    };\n\n}",
        "hook webhook into transition() on COMPLETED"
    );
}

if (process.exitCode === 1) {
    console.log("");
    console.log("Patch 15 stopped early — ride_engine.js was NOT fully modified. Check above for which step failed.");
    process.exit(1);
}

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

const files = [
    "backend/services/marketplace_webhook_service.js",
    "backend/canonical/ride_engine.js"
];

const ok = files.every(syntaxCheck);

console.log("");
if (ok) {
    console.log("Patch 15 complete — Digital Mall now gets notified when a marketplace ride completes.");
    console.log("Set MARKETPLACE_WEBHOOK_URL in Vercel env vars when Digital Mall gives you their endpoint.");
} else {
    console.log("Patch 15 wrote/patched files but a syntax check failed — review before deploying.");
}
