import os
import re

ROOT = os.getcwd()

FILES = [
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
]

print("=" * 80)
print("🚕 CABLINK — STAGE 4 LIFECYCLE WIRING TRACE")
print("=" * 80)

# ------------------------------------------------------------
# 1. PRINT RELEVANT FRONTEND FUNCTIONS
# ------------------------------------------------------------

terms = [
    "acceptRide",
    "accept",
    "arriv",
    "pickup",
    "pickUp",
    "start",
    "complete",
    "cancel",
    "status",
    "PATCH",
    "/api/rides/",
    "cablinkRideStateChanged",
    "CABLINK_FINANCE",
    "CABLINK_REWARD",
]

print("\n" + "=" * 80)
print("1. FRONTEND LIFECYCLE FUNCTIONS")
print("=" * 80)

for rel in FILES:

    path = os.path.join(ROOT, rel)

    if not os.path.exists(path):
        continue

    with open(path, "r", encoding="utf8", errors="ignore") as f:
        lines = f.readlines()

    hits = []

    for i, line in enumerate(lines):

        lower = line.lower()

        if any(term.lower() in lower for term in terms):

            start = max(0, i - 3)
            end = min(len(lines), i + 4)

            hits.append((i + 1, start, end))

    if not hits:
        continue

    print("\n" + "-" * 80)
    print(rel)
    print("-" * 80)

    shown = set()

    for line_no, start, end in hits:

        block_key = (start, end)

        if block_key in shown:
            continue

        shown.add(block_key)

        print(
            f"\n--- context around line {line_no} ---"
        )

        for j in range(start, end):
            print(
                f"{j + 1:4}: {lines[j].rstrip()}"
            )

# ------------------------------------------------------------
# 2. BACKEND ROUTE CONTRACT
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("2. CANONICAL BACKEND ROUTE CONTRACT")
print("=" * 80)

route_file = os.path.join(
    ROOT,
    "backend/routes/rides.js"
)

if os.path.exists(route_file):

    with open(
        route_file,
        "r",
        encoding="utf8",
        errors="ignore"
    ) as f:
        lines = f.readlines()

    for i, line in enumerate(lines):

        if any(
            x in line
            for x in [
                "router.post",
                "router.get",
                "router.patch",
                "transition",
                "ride_engine",
                "ride_repository",
                "status",
            ]
        ):

            print(
                f"{i + 1:4}: {line.rstrip()}"
            )

# ------------------------------------------------------------
# 3. ENGINE EXPORTS
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("3. CANONICAL ENGINE EXPORTS")
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

    for i, line in enumerate(
        text.splitlines(),
        1
    ):

        if (
            "module.exports" in line
            or "function " in line
            or "const " in line
            or "transition" in line
        ):

            print(
                f"{i:4}: {line}"
            )

# ------------------------------------------------------------
# 4. LIFECYCLE GAP DETECTION
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("4. LIFECYCLE GAP DETECTION")
print("=" * 80)

required = {
    "REQUESTED": [
        "REQUESTED",
        "/api/rides",
    ],

    "MATCHING": [
        "MATCHING",
    ],

    "DRIVER_ASSIGNED": [
        "DRIVER_ASSIGNED",
        "acceptRide",
    ],

    "DRIVER_ARRIVED": [
        "DRIVER_ARRIVED",
    ],

    "PICKED_UP": [
        "PICKED_UP",
    ],

    "STARTED": [
        "STARTED",
    ],

    "COMPLETED": [
        "COMPLETED",
        "completeRide",
    ],
}

all_text = ""

for rel in FILES:

    path = os.path.join(ROOT, rel)

    if os.path.exists(path):

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            all_text += "\n" + f.read()

for state, needles in required.items():

    found = []

    for needle in needles:

        if needle in all_text:

            found.append(needle)

    print(
        f"\n{state}:"
    )

    if found:

        for item in found:
            print(
                f"  ✅ {item}"
            )

    else:

        print(
            "  ❌ No matching implementation reference"
        )

# ------------------------------------------------------------
# 5. FINAL DECISION
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("🏁 STAGE 4 LIFECYCLE WIRING TRACE COMPLETE")
print("=" * 80)

print("""
IMPORTANT:

This is a READ-ONLY forensic trace.

No files were modified.

The next implementation decision must be based on the
actual function contexts printed above.

The canonical lifecycle remains:

REQUESTED
→ MATCHING
→ DRIVER_ASSIGNED
→ DRIVER_ARRIVED
→ PICKED_UP
→ STARTED
→ COMPLETED

The frontend must call the canonical PATCH route for each
valid transition.

No direct frontend state mutation should bypass the backend
state machine.

No second ride engine should be created.

No second repository should be created.

No historical ride data should be deleted.

After the lifecycle wiring is corrected:

1. Restart backend.
2. Verify GET /api/rides.
3. Create a fresh test ride.
4. Execute every lifecycle transition.
5. Verify invalid transitions are rejected.
6. Verify COMPLETED triggers the reward bridge.
7. Verify THB reward data is generated exactly once.
8. Verify persistence in backend/data/rides.json.
""")

