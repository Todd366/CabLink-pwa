from pathlib import Path
import re

ROOT = Path.cwd()

FILES = [
    "backend/routes/rides.js",
    "backend/routes/canonical_reward_api.js",
    "backend/routes/completion_api.js",
    "backend/services/canonical_reward_service.js",
    "backend/services/reward_service.js",
    "backend/rides/settlement_engine.js",
    "backend/rewards/thb_service.js",
    "backend/server/app.js",
    "backend/server.js",
]

TERMS = [
    "POST",
    "PUT",
    "PATCH",
    "wallet",
    "driverId",
    "passenger",
    "status",
    "COMPLETED",
    "complete",
    "completeRide",
    "updateRide",
    "createRewardForCompletedRide",
    "rideId",
]

print("=" * 80)
print("🚕 CABLINK — STAGE 4G.1 RECIPIENT FLOW AUDIT")
print("=" * 80)
print()
print("READ-ONLY APPLICATION FLOW DISCOVERY")
print("NO FILES WILL BE MODIFIED")
print("NO BLOCKCHAIN TRANSACTIONS WILL BE SENT")
print()

for relative in FILES:

    path = ROOT / relative

    print()
    print("=" * 80)
    print(f"===== {relative} =====")
    print("=" * 80)

    if not path.exists():
        print("⚪ FILE NOT FOUND")
        continue

    try:
        lines = path.read_text(
            encoding="utf-8",
            errors="ignore"
        ).splitlines()
    except Exception as error:
        print("❌ READ ERROR:", error)
        continue

    matches = []

    for number, line in enumerate(lines, start=1):

        if any(
            term.lower() in line.lower()
            for term in TERMS
        ):
            matches.append((number, line))

    if not matches:
        print("No relevant flow references found.")
        continue

    for number, line in matches:
        print(f"{number:4}: {line}")

print()
print("=" * 80)
print("===== CURRENT CANONICAL PENDING REWARD =====")
print("=" * 80)

ledger = ROOT / "backend/data/economy_ledger.json"

if ledger.exists():

    text = ledger.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    lines = text.splitlines()

    for number, line in enumerate(lines, start=1):

        if (
            "TX-1785012519292" in line
            or "RIDE-1785010715936" in line
            or '"wallet"' in line
            or '"status": "PENDING"' in line
        ):
            print(f"{number:4}: {line}")

else:

    print("⚪ Economy ledger not found")

print()
print("=" * 80)
print("STAGE 4G.1 AUDIT COMPLETE")
print("=" * 80)
print()
print("NO APPLICATION FILES WERE MODIFIED.")
print("NO BLOCKCHAIN TRANSACTIONS WERE SENT.")
print("=" * 80)

