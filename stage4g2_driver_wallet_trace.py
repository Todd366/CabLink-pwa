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
    "backend/rewards/wallet_service.js",
    "backend/services/economy_ledger_service.js",
    "backend/server/app.js",
    "backend/server.js",
]

TERMS = [
    "wallet",
    "walletAddress",
    "wallet_address",
    "driverWallet",
    "driver_wallet",
    "driverId",
    "driver",
    "passenger",
    "TEST-DRIVER-001",
    "TEST-WALLET",
    "createRide",
    "updateRide",
    "PATCH",
    "POST",
    "COMPLETED",
]

print("=" * 80)
print("🚕 CABLINK — STAGE 4G.2 DRIVER WALLET TRACE")
print("=" * 80)
print()
print("READ-ONLY DISCOVERY")
print("NO APPLICATION FILES WILL BE MODIFIED")
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
        print("No relevant wallet/driver references found.")
        continue

    for number, line in matches:
        print(f"{number:4}: {line}")


print()
print("=" * 80)
print("===== DRIVER / WALLET DATA FILE DISCOVERY =====")
print("=" * 80)

data_dir = ROOT / "backend" / "data"

if data_dir.exists():

    for path in sorted(data_dir.iterdir()):

        if not path.is_file():
            continue

        name = path.name.lower()

        if any(
            term in name
            for term in [
                "driver",
                "user",
                "wallet",
                "profile",
                "account",
                "ride",
                "ledger"
            ]
        ):

            print()
            print("FILE:", path.relative_to(ROOT))

            try:
                text = path.read_text(
                    encoding="utf-8",
                    errors="ignore"
                )

                for number, line in enumerate(
                    text.splitlines(),
                    start=1
                ):

                    if any(
                        term.lower() in line.lower()
                        for term in TERMS
                    ):

                        print(
                            f"{number:4}: {line}"
                        )

            except Exception as error:

                print(
                    "❌ READ ERROR:",
                    error
                )

else:

    print("⚪ backend/data directory not found")


print()
print("=" * 80)
print("===== CURRENT TEST RIDE =====")
print("=" * 80)

rides_file = (
    ROOT /
    "backend" /
    "data" /
    "rides.json"
)

if rides_file.exists():

    text = rides_file.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    lines = text.splitlines()

    inside_target = False

    for number, line in enumerate(
        lines,
        start=1
    ):

        if "RIDE-1785010715936" in line:

            inside_target = True

        if inside_target:

            print(
                f"{number:4}: {line}"
            )

            if line.strip() == "}":
                break

else:

    print(
        "⚪ rides.json not found"
    )


print()
print("=" * 80)
print("STAGE 4G.2 DRIVER WALLET TRACE COMPLETE")
print("=" * 80)
print()
print("NO APPLICATION FILES WERE MODIFIED.")
print("NO BLOCKCHAIN TRANSACTIONS WERE SENT.")
print("=" * 80)

