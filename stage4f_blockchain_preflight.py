from pathlib import Path
import json
import re
import subprocess
import urllib.request
import urllib.error

ROOT = Path.cwd()

print("=" * 80)
print("🚕 CABLINK — STAGE 4F BLOCKCHAIN SETTLEMENT PREFLIGHT")
print("=" * 80)
print()
print("READ-ONLY BLOCKCHAIN DISCOVERY")
print("NO APPLICATION FILES WILL BE MODIFIED")
print("NO SECRET VALUES WILL BE PRINTED")
print()

# ============================================================
# 1. PACKAGE DEPENDENCY CHECK
# ============================================================

print("=" * 80)
print("===== 1. BLOCKCHAIN DEPENDENCY CHECK =====")
print("=" * 80)

package_file = ROOT / "package.json"

dependencies = {}

if package_file.exists():

    try:
        package = json.loads(
            package_file.read_text(
                encoding="utf-8"
            )
        )

        dependencies.update(
            package.get("dependencies", {})
        )

        dependencies.update(
            package.get("devDependencies", {})
        )

    except Exception as error:

        print(
            "❌ package.json read error:",
            error
        )

else:

    print("❌ package.json NOT FOUND")

for name in [
    "ethers",
    "web3",
    "viem"
]:

    if name in dependencies:

        print(
            f"  ✅ {name}: {dependencies[name]}"
        )

    else:

        print(
            f"  ⚪ {name}: NOT DECLARED"
        )


# ============================================================
# 2. NODE MODULE CHECK
# ============================================================

print()
print("=" * 80)
print("===== 2. INSTALLED NODE MODULE CHECK =====")
print("=" * 80)

for name in [
    "ethers",
    "web3",
    "viem"
]:

    module_path = (
        ROOT /
        "node_modules" /
        name
    )

    if module_path.exists():

        print(
            f"  ✅ {name}: installed"
        )

    else:

        print(
            f"  ⚪ {name}: not installed"
        )


# ============================================================
# 3. ENVIRONMENT VARIABLE NAME CHECK
# ============================================================

print()
print("=" * 80)
print("===== 3. BLOCKCHAIN ENVIRONMENT CONFIG =====")
print("=" * 80)

env_files = [
    ROOT / ".env",
    ROOT / "backend" / ".env"
]

env_keys = {}

for env_file in env_files:

    if not env_file.exists():

        continue

    print()
    print(
        "File:",
        env_file.relative_to(ROOT)
    )

    for line in env_file.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines():

        line = line.strip()

        if (
            not line
            or line.startswith("#")
            or "=" not in line
        ):

            continue

        key, value = line.split(
            "=",
            1
        )

        key = key.strip()
        value = value.strip()

        env_keys[key] = value

        if key in [
            "PRIVATE_KEY",
            "RPC_URL",
            "CONTRACT_ADDRESS",
            "TREASURY_WALLET"
        ]:

            if value:

                print(
                    f"  ✅ {key}: PRESENT"
                )

            else:

                print(
                    f"  ⚠️ {key}: EMPTY"
                )


# ============================================================
# 4. PLACEHOLDER DETECTION
# ============================================================

print()
print("=" * 80)
print("===== 4. PLACEHOLDER CONFIGURATION CHECK =====")
print("=" * 80)

placeholder_patterns = [
    "your_",
    "YOUR_",
    "replace",
    "REPLACE",
    "example",
    "EXAMPLE",
    "changeme",
    "CHANGE_ME"
]

for key in [
    "PRIVATE_KEY",
    "RPC_URL",
    "CONTRACT_ADDRESS",
    "TREASURY_WALLET"
]:

    value = env_keys.get(
        key,
        ""
    )

    if not value:

        print(
            f"  ⚪ {key}: NOT PRESENT"
        )

        continue

    is_placeholder = any(
        pattern in value
        for pattern in placeholder_patterns
    )

    if is_placeholder:

        print(
            f"  ⚠️ {key}: PLACEHOLDER DETECTED"
        )

    else:

        print(
            f"  ✅ {key}: NON-PLACEHOLDER VALUE DETECTED"
        )


# ============================================================
# 5. RPC URL FORMAT CHECK
# ============================================================

print()
print("=" * 80)
print("===== 5. RPC CONFIGURATION CHECK =====")
print("=" * 80)

rpc_url = env_keys.get(
    "RPC_URL",
    ""
)

if rpc_url:

    print(
        "  RPC URL configured: YES"
    )

    if (
        rpc_url.startswith("http://")
        or rpc_url.startswith("https://")
    ):

        print(
            "  ✅ RPC URL format valid"
        )

    else:

        print(
            "  ❌ RPC URL format invalid"
        )

else:

    print(
        "  ❌ RPC URL missing"
    )


# ============================================================
# 6. CONTRACT ADDRESS FORMAT CHECK
# ============================================================

print()
print("=" * 80)
print("===== 6. CONTRACT ADDRESS FORMAT CHECK =====")
print("=" * 80)

contract = env_keys.get(
    "CONTRACT_ADDRESS",
    ""
)

if contract:

    if re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        contract
    ):

        print(
            "  ✅ CONTRACT_ADDRESS has valid EVM address format"
        )

    else:

        print(
            "  ❌ CONTRACT_ADDRESS format invalid"
        )

else:

    print(
        "  ❌ CONTRACT_ADDRESS missing"
    )


# ============================================================
# 7. TREASURY ADDRESS FORMAT CHECK
# ============================================================

print()
print("=" * 80)
print("===== 7. TREASURY WALLET FORMAT CHECK =====")
print("=" * 80)

treasury = env_keys.get(
    "TREASURY_WALLET",
    ""
)

if treasury:

    if re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        treasury
    ):

        print(
            "  ✅ TREASURY_WALLET has valid EVM address format"
        )

    else:

        print(
            "  ❌ TREASURY_WALLET format invalid"
        )

else:

    print(
        "  ❌ TREASURY_WALLET missing"
    )


# ============================================================
# 8. RPC CHAIN ID PROBE
# ============================================================

print()
print("=" * 80)
print("===== 8. BSC TESTNET RPC CHAIN PROBE =====")
print("=" * 80)

chain_id = None

if rpc_url:

    payload = json.dumps({
        "jsonrpc": "2.0",
        "method": "eth_chainId",
        "params": [],
        "id": 1
    }).encode(
        "utf-8"
    )

    request = urllib.request.Request(
        rpc_url,
        data=payload,
        headers={
            "Content-Type":
                "application/json"
        },
        method="POST"
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            body = response.read().decode(
                "utf-8",
                errors="replace"
            )

            result = json.loads(
                body
            )

            chain_id = result.get(
                "result"
            )

            print(
                "  RPC response received: YES"
            )

            print(
                "  Chain ID:",
                chain_id
            )

            if chain_id == "0x61":

                print(
                    "  ✅ BSC Testnet detected (chain ID 97)"
                )

            else:

                print(
                    "  ⚠️ RPC is responding, but chain ID is not BSC Testnet"
                )

    except Exception as error:

        print(
            "  ❌ RPC probe failed:",
            error
        )

else:

    print(
        "  ⚪ RPC probe skipped"
    )


# ============================================================
# 9. CONTRACT BYTECODE PROBE
# ============================================================

print()
print("=" * 80)
print("===== 9. CONTRACT DEPLOYMENT PROBE =====")
print("=" * 80)

if (
    rpc_url
    and re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        contract
    )
):

    payload = json.dumps({
        "jsonrpc": "2.0",
        "method": "eth_getCode",
        "params": [
            contract,
            "latest"
        ],
        "id": 2
    }).encode(
        "utf-8"
    )

    request = urllib.request.Request(
        rpc_url,
        data=payload,
        headers={
            "Content-Type":
                "application/json"
        },
        method="POST"
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            body = response.read().decode(
                "utf-8",
                errors="replace"
            )

            result = json.loads(
                body
            )

            code = result.get(
                "result"
            )

            if (
                code
                and code != "0x"
            ):

                print(
                    "  ✅ Contract bytecode exists"
                )

                print(
                    "  Bytecode detected: YES"
                )

            else:

                print(
                    "  ❌ No contract bytecode found"
                )

    except Exception as error:

        print(
            "  ❌ Contract probe failed:",
            error
        )

else:

    print(
        "  ⚪ Contract probe skipped"
    )


# ============================================================
# 10. CANONICAL REWARD STATE CHECK
# ============================================================

print()
print("=" * 80)
print("===== 10. CANONICAL PENDING REWARD CHECK =====")
print("=" * 80)

ledger_file = (
    ROOT /
    "backend" /
    "data" /
    "economy_ledger.json"
)

pending_rewards = []

if ledger_file.exists():

    try:

        ledger = json.loads(
            ledger_file.read_text(
                encoding="utf-8"
            )
        )

        for tx in ledger.get(
            "transactions",
            []
        ):

            if (
                tx.get("type")
                == "THB_REWARD"
                and tx.get("status")
                == "PENDING"
            ):

                pending_rewards.append(
                    tx
                )

        print(
            "  Pending canonical THB rewards:",
            len(pending_rewards)
        )

        for tx in pending_rewards:

            print(
                "   •",
                tx.get("id"),
                "| rideId:",
                tx.get("rideId"),
                "| wallet:",
                tx.get("wallet"),
                "| amount:",
                tx.get("amount"),
                "| status:",
                tx.get("status")
            )

    except Exception as error:

        print(
            "  ❌ Ledger read error:",
            error
        )

else:

    print(
        "  ⚪ Economy ledger not found"
    )


# ============================================================
# 11. FINAL PREFLIGHT VERDICT
# ============================================================

print()
print("=" * 80)
print("===== STAGE 4F PREFLIGHT VERDICT =====")
print("=" * 80)

print()

if (
    rpc_url
    and chain_id == "0x61"
):

    print(
        "  ✅ RPC ACCESSIBLE"
    )

else:

    print(
        "  ⚠️ RPC NOT VERIFIED AS BSC TESTNET"
    )


if (
    re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        contract
    )
):

    print(
        "  ✅ CONTRACT ADDRESS FORMAT VALID"
    )

else:

    print(
        "  ❌ CONTRACT ADDRESS NOT VALID"
    )


if (
    re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        treasury
    )
):

    print(
        "  ✅ TREASURY ADDRESS FORMAT VALID"
    )

else:

    print(
        "  ❌ TREASURY ADDRESS NOT VALID"
    )


if pending_rewards:

    print(
        "  ✅ CANONICAL PENDING REWARD AVAILABLE"
    )

else:

    print(
        "  ⚠️ NO CANONICAL PENDING REWARD FOUND"
    )


print()
print("IMPORTANT:")
print("This preflight does NOT send blockchain transactions.")
print("This preflight does NOT expose private keys.")
print("This preflight does NOT modify application files.")
print()
print("=" * 80)
print("STAGE 4F PREFLIGHT COMPLETE")
print("=" * 80)

