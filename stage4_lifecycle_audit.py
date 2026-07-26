import os
import re

ROOT = os.getcwd()

print("=" * 80)
print("🚕 CABLINK — STAGE 4 FRONTEND/BACKEND LIFECYCLE FORENSIC AUDIT")
print("=" * 80)

# ============================================================
# FILES TO AUDIT
# ============================================================

targets = [
    "frontend/js/app.js",
    "frontend/js/app_core.js",
    "frontend/js/services/api.js",
    "frontend/js/driver/driverController.js",
    "frontend/js/driver/driverService.js",
    "frontend/js/rides/rideController.js",
    "frontend/js/rides/rideService.js",
    "frontend/services/ride_service.js",
    "frontend/js/rides/completionRewardBridge.js",
    "backend/routes/rides.js",
    "backend/canonical/ride_engine.js",
    "backend/canonical/ride_repository.js",
    "backend/server.js",
    "backend/server/app.js",
]

# ============================================================
# STATUS VOCABULARY
# ============================================================

statuses = [
    "REQUESTED",
    "MATCHING",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVED",
    "PICKED_UP",
    "STARTED",
    "COMPLETED",
    "CANCELLED",

    # Legacy / alternate
    "requested",
    "matching",
    "accepted",
    "ACCEPTED",
    "arriving",
    "ARRIVING",
    "driver_arrived",
    "picked_up",
    "PICKEDUP",
    "in_progress",
    "IN_PROGRESS",
    "started",
    "completed",
    "cancelled",
]

# ============================================================
# 1. FILE INVENTORY
# ============================================================

print("\n" + "=" * 80)
print("1. TARGET FILE INVENTORY")
print("=" * 80)

existing = {}

for rel in targets:

    path = os.path.join(ROOT, rel)

    if os.path.exists(path):

        existing[rel] = True

        size = os.path.getsize(path)

        print(
            f"  ✅ {rel} "
            f"({size} bytes)"
        )

    else:

        existing[rel] = False

        print(
            f"  ⚠️ MISSING {rel}"
        )

# ============================================================
# 2. STATUS REFERENCES
# ============================================================

print("\n" + "=" * 80)
print("2. STATUS VOCABULARY REFERENCES")
print("=" * 80)

for rel in targets:

    path = os.path.join(ROOT, rel)

    if not os.path.exists(path):
        continue

    try:

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            text = f.read()

    except Exception:

        continue

    found = []

    for status in statuses:

        if re.search(
            r"(?<![A-Za-z0-9_])"
            + re.escape(status)
            + r"(?![A-Za-z0-9_])",
            text
        ):

            found.append(status)

    if found:

        print(
            "\n📄 " + rel
        )

        print(
            "   " +
            ", ".join(found)
        )

# ============================================================
# 3. STATUS WRITE OPERATIONS
# ============================================================

print("\n" + "=" * 80)
print("3. STATUS WRITE OPERATIONS")
print("=" * 80)

write_patterns = [
    r"status\s*[:=]\s*['\"]([^'\"]+)['\"]",
    r"status\s*=\s*['\"]([^'\"]+)['\"]",
    r"\.status\s*=\s*['\"]([^'\"]+)['\"]",
    r"status\s*:\s*([A-Z_]+)",
]

for rel in targets:

    path = os.path.join(ROOT, rel)

    if not os.path.exists(path):
        continue

    try:

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            lines = f.readlines()

    except Exception:

        continue

    matches = []

    for number, line in enumerate(lines, 1):

        if (
            "status" not in line.lower()
            and "state" not in line.lower()
        ):

            continue

        for pattern in write_patterns:

            found = re.findall(
                pattern,
                line
            )

            for value in found:

                matches.append(
                    (
                        number,
                        value,
                        line.strip()
                    )
                )

    if matches:

        print(
            "\n📄 " + rel
        )

        for number, value, line in matches:

            print(
                f"   {number}: "
                f"{value} "
                f"→ {line}"
            )

# ============================================================
# 4. API CALLS
# ============================================================

print("\n" + "=" * 80)
print("4. RIDE API CALLS")
print("=" * 80)

api_patterns = [
    "/api/rides",
    "PATCH",
    "POST",
    "GET",
    "fetch(",
    "axios",
]

for rel in targets:

    path = os.path.join(ROOT, rel)

    if not os.path.exists(path):
        continue

    try:

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            lines = f.readlines()

    except Exception:

        continue

    found = []

    for number, line in enumerate(lines, 1):

        if (
            "/api/rides" in line
            or "fetch(" in line
            or "axios" in line
        ):

            found.append(
                (
                    number,
                    line.strip()
                )
            )

    if found:

        print(
            "\n📄 " + rel
        )

        for number, line in found:

            print(
                f"   {number}: {line}"
            )

# ============================================================
# 5. DRIVER ACTIONS
# ============================================================

print("\n" + "=" * 80)
print("5. DRIVER LIFECYCLE ACTIONS")
print("=" * 80)

driver_terms = [
    "accept",
    "accepted",
    "arriv",
    "pickup",
    "pick",
    "start",
    "complete",
    "cancel",
]

for rel in targets:

    path = os.path.join(ROOT, rel)

    if not os.path.exists(path):
        continue

    try:

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            lines = f.readlines()

    except Exception:

        continue

    found = []

    for number, line in enumerate(lines, 1):

        lower = line.lower()

        if any(
            term in lower
            for term in driver_terms
        ):

            if (
                "ride" in lower
                or "status" in lower
                or "api" in lower
                or "fetch" in lower
            ):

                found.append(
                    (
                        number,
                        line.strip()
                    )
                )

    if found:

        print(
            "\n📄 " + rel
        )

        for number, line in found:

            print(
                f"   {number}: {line}"
            )

# ============================================================
# 6. REWARD BRIDGE
# ============================================================

print("\n" + "=" * 80)
print("6. COMPLETION REWARD BRIDGE")
print("=" * 80)

reward_file = os.path.join(
    ROOT,
    "frontend/js/rides/completionRewardBridge.js"
)

if os.path.exists(reward_file):

    with open(
        reward_file,
        "r",
        encoding="utf8",
        errors="ignore"
    ) as f:

        text = f.read()

    for number, line in enumerate(
        text.splitlines(),
        1
    ):

        if (
            "COMPLETED" in line
            or "completed" in line
            or "reward" in line.lower()
            or "THB" in line
            or "cablinkRideStateChanged" in line
        ):

            print(
                f"   {number}: {line.strip()}"
            )

else:

    print(
        "⚠️ completionRewardBridge.js not found"
    )

# ============================================================
# 7. CANONICAL ENGINE TRANSITIONS
# ============================================================

print("\n" + "=" * 80)
print("7. CANONICAL ENGINE TRANSITIONS")
print("=" * 80)

engine_file = os.path.join(
    ROOT,
    "backend/canonical/ride_engine.js"
)

if os.path.exists(engine_file):

    with open(
        engine_file,
        "r",
        encoding="utf8",
        errors="ignore"
    ) as f:

        text = f.read()

    for number, line in enumerate(
        text.splitlines(),
        1
    ):

        if (
            "TRANSITION" in line.upper()
            or "REQUESTED" in line
            or "MATCHING" in line
            or "DRIVER_ASSIGNED" in line
            or "DRIVER_ARRIVED" in line
            or "PICKED_UP" in line
            or "STARTED" in line
            or "COMPLETED" in line
            or "CANCELLED" in line
        ):

            print(
                f"   {number}: {line.strip()}"
            )

else:

    print(
        "❌ Canonical engine missing"
    )

# ============================================================
# 8. FRONTEND COMPATIBILITY RISKS
# ============================================================

print("\n" + "=" * 80)
print("8. POTENTIAL LIFECYCLE COMPATIBILITY RISKS")
print("=" * 80)

risk_map = {
    "ARRIVING": "DRIVER_ARRIVED",
    "arriving": "DRIVER_ARRIVED",
    "ACCEPTED": "DRIVER_ASSIGNED",
    "accepted": "DRIVER_ASSIGNED",
    "IN_PROGRESS": "STARTED",
    "in_progress": "STARTED",
    "completed": "COMPLETED",
    "requested": "REQUESTED",
    "cancelled": "CANCELLED",
}

for old, canonical in risk_map.items():

    found_files = []

    for rel in targets:

        path = os.path.join(ROOT, rel)

        if not os.path.exists(path):
            continue

        try:

            with open(
                path,
                "r",
                encoding="utf8",
                errors="ignore"
            ) as f:

                text = f.read()

        except Exception:

            continue

        if re.search(
            r"(?<![A-Za-z0-9_])"
            + re.escape(old)
            + r"(?![A-Za-z0-9_])",
            text
        ):

            found_files.append(rel)

    if found_files:

        print(
            f"\n⚠️ {old} "
            f"→ canonical {canonical}"
        )

        for rel in found_files:

            print(
                "   " + rel
            )

# ============================================================
# 9. FINAL DECISION
# ============================================================

print("\n" + "=" * 80)
print("🏁 STAGE 4 FORENSIC AUDIT COMPLETE")
print("=" * 80)

print("""
NEXT ACTION:

Use this audit output to perform ONE controlled alignment pass.

Rules:

1. Do not create another ride engine.
2. Do not create another ride repository.
3. Do not delete legacy files yet.
4. Do not blindly replace every string occurrence.
5. Only modify active frontend lifecycle writers/readers.
6. Preserve historical data.
7. Canonical backend statuses remain authoritative.

TARGET:

REQUESTED
→ MATCHING
→ DRIVER_ASSIGNED
→ DRIVER_ARRIVED
→ PICKED_UP
→ STARTED
→ COMPLETED

Then:

COMPLETED
→ completionRewardBridge
→ THB reward flow

After alignment:

Run the full Stage 3 verification again.

Then run a dedicated Stage 4 end-to-end lifecycle test.

Only after both pass should obsolete ride implementations be quarantined.
""")

