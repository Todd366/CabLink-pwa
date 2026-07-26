from pathlib import Path

ROOT = Path.cwd()

FILES = [
    "backend/routes/rides.js",
    "backend/routes/completion_api.js",
    "backend/canonical/ride_engine.js",
    "backend/canonical/ride_repository.js",
    "backend/services/ride_completion_service.js",
    "backend/rides/settlement_engine.js",
    "backend/rewards/thb_service.js",
    "backend/services/reward_service.js",
    "backend/services/economy_ledger_service.js",
    "backend/storage/database.js",
    "backend/database/production_schema.js",
    "backend/server.js",
    "backend/server/app.js",
]

print("=" * 80)
print("🚕 CABLINK — STAGE 4B EXACT REWARD TRACE")
print("=" * 80)
print()
print("READ-ONLY SOURCE TRACE")
print("NO FILES WILL BE MODIFIED")
print()

for relative in FILES:

    path = ROOT / relative

    print()
    print("=" * 80)
    print(f"===== {relative} =====")
    print("=" * 80)

    if not path.exists():
        print("⚠️ FILE NOT FOUND")
        continue

    try:
        text = path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception as e:
        print("❌ READ ERROR:", e)
        continue

    print(text)

print()
print("=" * 80)
print("END STAGE 4B EXACT REWARD TRACE")
print("=" * 80)
print()
print("NO FILES WERE MODIFIED BY THIS AUDIT.")
