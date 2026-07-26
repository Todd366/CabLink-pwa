from pathlib import Path
import re

ROOT = Path.cwd()

FILES = [
    "backend/rewards/thb_service.js",
    "backend/services/canonical_reward_service.js",
    "backend/services/reward_service.js",
    "backend/rides/settlement_engine.js",
    "backend/services/economy_ledger_service.js",
    "backend/routes/canonical_reward_api.js",
    "backend/routes/completion_api.js",
    "backend/routes/rides.js",
    "backend/server/app.js",
    "backend/server.js",
    "backend/payments/payment_engine.js",
    "backend/rewards/wallet_service.js",
    "backend/blockchain/thb_service.js",
    "backend/blockchain/reward_service.js",
    "backend/blockchain/contract_service.js",
    "backend/blockchain/provider.js",
    "backend/config/blockchain.js",
    "backend/config.js",
    "backend/.env",
    ".env",
]

SEARCH_TERMS = [
    "THB",
    "reward",
    "PENDING",
    "CONFIRMED",
    "FAILED",
    "txHash",
    "transactionHash",
    "blockHash",
    "receipt",
    "wait",
    "confirm",
    "ethers",
    "Wallet",
    "Contract",
    "JsonRpcProvider",
    "BSC",
    "chainId",
    "97",
    "testnet",
    "transfer",
    "sendTransaction",
    "mint",
    "claim",
    "wallet",
]

print("=" * 80)
print("🚕 CABLINK — STAGE 4E THB SETTLEMENT TRACE")
print("=" * 80)
print()
print("READ-ONLY DISCOVERY AUDIT")
print("NO APPLICATION FILES WILL BE MODIFIED")
print()

found_files = []

for relative in FILES:

    path = ROOT / relative

    print()
    print("=" * 80)
    print(f"===== {relative} =====")
    print("=" * 80)

    if not path.exists():
        print("⚪ FILE NOT FOUND")
        continue

    found_files.append(relative)

    try:
        text = path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception as error:
        print("❌ READ ERROR:", error)
        continue

    print(f"FILE SIZE: {len(text)} bytes")
    print()

    lines = text.splitlines()

    matches = []

    for index, line in enumerate(lines, start=1):

        if any(
            term.lower() in line.lower()
            for term in SEARCH_TERMS
        ):

            matches.append(
                (index, line)
            )

    if not matches:

        print("No settlement-related keywords found.")

        continue

    print(
        f"Settlement-related matches: {len(matches)}"
    )

    for index, line in matches:

        print(
            f"{index:4}: {line}"
        )

print()
print("=" * 80)
print("===== DISCOVERY SUMMARY =====")
print("=" * 80)

print()
print("Files found:")

for file in found_files:
    print("  ✅", file)

print()
print("===== DATA FILES =====")

DATA_FILES = [
    "backend/data/economy_ledger.json",
    "backend/data/rides.json",
    "backend/data/rewards.json",
    "backend/data/transactions.json",
]

for relative in DATA_FILES:

    path = ROOT / relative

    if path.exists():

        print()
        print(f"===== {relative} =====")

        try:

            text = path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            print(text)

        except Exception as error:

            print(
                "❌ READ ERROR:",
                error
            )

    else:

        print(
            f"⚪ {relative} NOT FOUND"
        )

print()
print("=" * 80)
print("===== PACKAGE / DEPENDENCY TRACE =====")
print("=" * 80)

package = ROOT / "package.json"

if package.exists():

    text = package.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    for term in [
        "ethers",
        "web3",
        "viem",
        "firebase",
        "walletconnect"
    ]:

        if term.lower() in text.lower():

            print(
                f"  ✅ Dependency reference found: {term}"
            )

else:

    print(
        "⚪ package.json not found"
    )

print()
print("=" * 80)
print("===== ENVIRONMENT VARIABLE NAMES ONLY =====")
print("=" * 80)

ENV_FILES = [
    ROOT / ".env",
    ROOT / "backend/.env",
]

for env_file in ENV_FILES:

    if not env_file.exists():

        continue

    print()
    print(env_file.relative_to(ROOT))

    try:

        for line in env_file.read_text(
            encoding="utf-8",
            errors="ignore"
        ).splitlines():

            stripped = line.strip()

            if (
                not stripped
                or stripped.startswith("#")
                or "=" not in stripped
            ):

                continue

            key = stripped.split(
                "=",
                1
            )[0].strip()

            print(
                "  •",
                key
            )

    except Exception as error:

        print(
            "❌ ENV READ ERROR:",
            error
        )

print()
print("=" * 80)
print("STAGE 4E DISCOVERY COMPLETE")
print("=" * 80)
print()
print("NO APPLICATION FILES WERE MODIFIED.")
print()
print("IMPORTANT:")
print("This audit prints environment VARIABLE NAMES only.")
print("Secret values are never printed.")
print("=" * 80)

