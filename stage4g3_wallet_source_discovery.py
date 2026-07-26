from pathlib import Path
import re

ROOT = Path.cwd()

print("=" * 80)
print("🚕 CABLINK — STAGE 4G.3 WALLET SOURCE DISCOVERY")
print("=" * 80)
print()
print("READ-ONLY PROJECT-WIDE DISCOVERY")
print("NO FILES WILL BE MODIFIED")
print("NO BLOCKCHAIN TRANSACTIONS WILL BE SENT")
print("PRIVATE KEY VALUES WILL NOT BE PRINTED")
print()

# ============================================================
# 1. SEARCH PROJECT FOR EVM ADDRESSES
# ============================================================

print("=" * 80)
print("===== 1. EVM WALLET ADDRESS DISCOVERY =====")
print("=" * 80)

evm_pattern = re.compile(
    r"0x[a-fA-F0-9]{40}"
)

found_addresses = {}

skip_dirs = {
    ".git",
    "node_modules",
    ".cache",
    "dist",
    "build"
}

for path in ROOT.rglob("*"):

    if not path.is_file():
        continue

    if any(
        part in skip_dirs
        for part in path.parts
    ):
        continue

    try:
        text = path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception:
        continue

    matches = evm_pattern.findall(text)

    if not matches:
        continue

    relative = str(
        path.relative_to(ROOT)
    )

    for address in matches:

        # Never report private keys.
        if len(address) == 42:

            found_addresses.setdefault(
                address.lower(),
                []
            ).append(relative)

for address, files in found_addresses.items():

    print()
    print("Address:", address)
    print("Found in:")

    for file in sorted(set(files)):

        print(
            "  •",
            file
        )

if not found_addresses:

    print(
        "⚪ No EVM wallet addresses found."
    )


# ============================================================
# 2. SEARCH FOR TEST DRIVER REFERENCES
# ============================================================

print()
print("=" * 80)
print("===== 2. TEST DRIVER WALLET REFERENCES =====")
print("=" * 80)

search_terms = [
    "TEST-DRIVER-001",
    "TEST-WALLET",
    "Stage 3 Test Driver",
    "driverWallet",
    "driver_wallet",
    "walletAddress",
    "wallet_address",
    "wallet",
    "connectWallet",
    "connectedWallet",
    "account",
    "signer",
    "getAddress",
]

for path in ROOT.rglob("*"):

    if not path.is_file():
        continue

    if any(
        part in skip_dirs
        for part in path.parts
    ):
        continue

    try:
        lines = path.read_text(
            encoding="utf-8",
            errors="ignore"
        ).splitlines()
    except Exception:
        continue

    matches = []

    for number, line in enumerate(
        lines,
        start=1
    ):

        if any(
            term.lower() in line.lower()
            for term in search_terms
        ):

            matches.append(
                (number, line)
            )

    if not matches:
        continue

    print()
    print(
        "===== ",
        path.relative_to(ROOT),
        " ====="
    )

    for number, line in matches:

        print(
            f"{number:4}: {line}"
        )


# ============================================================
# 3. FRONTEND WALLET DISCOVERY
# ============================================================

print()
print("=" * 80)
print("===== 3. FRONTEND WALLET / BLOCKCHAIN REFERENCES =====")
print("=" * 80)

frontend_dirs = [
    ROOT / "frontend",
    ROOT / "src",
    ROOT / "public"
]

frontend_terms = [
    "ethers",
    "WalletConnect",
    "walletconnect",
    "BrowserProvider",
    "JsonRpcProvider",
    "getSigner",
    "getAddress",
    "accounts",
    "ethereum",
    "window.ethereum",
    "chainId",
    "97",
    "BSC Testnet",
    "THB",
    "THoBoCoin",
]

for directory in frontend_dirs:

    if not directory.exists():
        continue

    for path in directory.rglob("*"):

        if not path.is_file():
            continue

        try:
            lines = path.read_text(
                encoding="utf-8",
                errors="ignore"
            ).splitlines()
        except Exception:
            continue

        matches = []

        for number, line in enumerate(
            lines,
            start=1
        ):

            if any(
                term.lower() in line.lower()
                for term in frontend_terms
            ):

                matches.append(
                    (number, line)
                )

        if not matches:
            continue

        print()
        print(
            "===== ",
            path.relative_to(ROOT),
            " ====="
        )

        for number, line in matches:

            print(
                f"{number:4}: {line}"
            )


# ============================================================
# 4. DRIVER DATA
# ============================================================

print()
print("=" * 80)
print("===== 4. DRIVER RECORDS =====")
print("=" * 80)

driver_files = [
    ROOT / "backend/data/drivers.json",
    ROOT / "backend/data/drivers_live.json",
    ROOT / "backend/data/users.json",
]

for path in driver_files:

    if not path.exists():
        continue

    print()
    print(
        "===== ",
        path.relative_to(ROOT),
        " ====="
    )

    try:

        lines = path.read_text(
            encoding="utf-8",
            errors="ignore"
        ).splitlines()

        for number, line in enumerate(
            lines,
            start=1
        ):

            if any(
                term.lower() in line.lower()
                for term in [
                    "DRIVER001",
                    "TEST-DRIVER-001",
                    "wallet",
                    "address",
                    "name",
                    "role"
                ]
            ):

                print(
                    f"{number:4}: {line}"
                )

    except Exception as error:

        print(
            "❌ READ ERROR:",
            error
        )


# ============================================================
# 5. FINAL SUMMARY
# ============================================================

print()
print("=" * 80)
print("===== STAGE 4G.3 DISCOVERY SUMMARY =====")
print("=" * 80)

print()
print(
    "EVM addresses discovered:",
    len(found_addresses)
)

print()

if found_addresses:

    print(
        "✅ At least one EVM address exists somewhere in the project."
    )

    print(
        "Review the file references above to determine whether"
    )

    print(
        "one belongs to the test driver or a connected user."
    )

else:

    print(
        "⚠️ No EVM recipient address was discovered in project files."
    )

print()
print(
    "Current blocked recipient:"
)

print(
    "  TEST-WALLET"
)

print()
print(
    "Required recipient format:"
)

print(
    "  0x + 40 hexadecimal characters"
)

print()
print("=" * 80)
print("STAGE 4G.3 COMPLETE")
print("=" * 80)

