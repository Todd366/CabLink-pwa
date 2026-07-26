from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path.cwd()

print("=" * 80)
print("🚕 CABLINK — STAGE 4G SETTLEMENT CONFIGURATION PREFLIGHT")
print("=" * 80)
print()
print("READ-ONLY VERIFICATION")
print("NO BLOCKCHAIN TRANSACTIONS WILL BE SENT")
print("NO APPLICATION FILES WILL BE MODIFIED")
print("NO PRIVATE KEY VALUES WILL BE PRINTED")
print()

# ============================================================
# 1. LOAD ENVIRONMENT CONFIGURATION
# ============================================================

print("=" * 80)
print("===== 1. ENVIRONMENT CONFIGURATION =====")
print("=" * 80)

env_file = ROOT / ".env"

if not env_file.exists():
    print("❌ .env FILE NOT FOUND")
    raise SystemExit(1)

env = {}

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

    key, value = line.split("=", 1)

    env[key.strip()] = value.strip()

required_keys = [
    "PRIVATE_KEY",
    "RPC_URL",
    "CONTRACT_ADDRESS",
    "TREASURY_WALLET"
]

for key in required_keys:

    value = env.get(key, "")

    if value:
        print(f"  ✅ {key}: PRESENT")
    else:
        print(f"  ❌ {key}: MISSING")


# ============================================================
# 2. PLACEHOLDER DETECTION
# ============================================================

print()
print("=" * 80)
print("===== 2. PLACEHOLDER DETECTION =====")
print("=" * 80)

placeholder_values = [
    "your_treasury_wallet_private_key_here",
    "your_treasury_wallet_here",
    "YOUR_PRIVATE_KEY",
    "YOUR_TREASURY_WALLET",
    "replace_me",
    "REPLACE_ME",
    "changeme",
    "CHANGE_ME"
]

private_key = env.get(
    "PRIVATE_KEY",
    ""
)

treasury_wallet = env.get(
    "TREASURY_WALLET",
    ""
)

if (
    not private_key
    or private_key in placeholder_values
):

    print(
        "  ❌ PRIVATE_KEY is not configured with a usable value"
    )

    private_key_valid = False

else:

    print(
        "  ✅ PRIVATE_KEY is not an obvious placeholder"
    )

    private_key_valid = True


if (
    not treasury_wallet
    or treasury_wallet in placeholder_values
):

    print(
        "  ❌ TREASURY_WALLET is not configured with a usable value"
    )

    treasury_valid = False

else:

    print(
        "  ✅ TREASURY_WALLET is not an obvious placeholder"
    )

    treasury_valid = True


# ============================================================
# 3. EVM ADDRESS FORMAT
# ============================================================

print()
print("=" * 80)
print("===== 3. EVM ADDRESS FORMAT CHECK =====")
print("=" * 80)

contract = env.get(
    "CONTRACT_ADDRESS",
    ""
)

evm_pattern = r"0x[a-fA-F0-9]{40}"

contract_valid = bool(
    re.fullmatch(
        evm_pattern,
        contract
    )
)

treasury_address_valid = bool(
    re.fullmatch(
        evm_pattern,
        treasury_wallet
    )
)

if contract_valid:
    print(
        "  ✅ CONTRACT_ADDRESS format valid"
    )
else:
    print(
        "  ❌ CONTRACT_ADDRESS format invalid"
    )

if treasury_address_valid:
    print(
        "  ✅ TREASURY_WALLET format valid"
    )
else:
    print(
        "  ❌ TREASURY_WALLET format invalid"
    )


# ============================================================
# 4. ETHERS AVAILABILITY
# ============================================================

print()
print("=" * 80)
print("===== 4. ETHERS AVAILABILITY =====")
print("=" * 80)

ethers_available = False

try:

    result = subprocess.run(
        [
            "node",
            "-e",
            "require('ethers'); console.log('ETHERS_OK')"
        ],
        capture_output=True,
        text=True
    )

    if (
        result.returncode == 0
        and "ETHERS_OK" in result.stdout
    ):

        ethers_available = True

        print(
            "  ✅ ethers runtime module available"
        )

    else:

        print(
            "  ❌ ethers runtime module unavailable"
        )

except Exception as error:

    print(
        "  ❌ ethers check failed:",
        error
    )


# ============================================================
# 5. PACKAGE.JSON DEPENDENCY DECLARATION
# ============================================================

print()
print("=" * 80)
print("===== 5. PACKAGE.JSON DEPENDENCY DECLARATION =====")
print("=" * 80)

package_file = ROOT / "package.json"

ethers_declared = False

if package_file.exists():

    try:

        package = json.loads(
            package_file.read_text(
                encoding="utf-8"
            )
        )

        all_dependencies = {}

        all_dependencies.update(
            package.get(
                "dependencies",
                {}
            )
        )

        all_dependencies.update(
            package.get(
                "devDependencies",
                {}
            )
        )

        if "ethers" in all_dependencies:

            ethers_declared = True

            print(
                "  ✅ ethers declared:",
                all_dependencies["ethers"]
            )

        else:

            print(
                "  ⚠️ ethers installed but NOT declared in package.json"
            )

    except Exception as error:

        print(
            "  ❌ package.json parse error:",
            error
        )

else:

    print(
        "  ❌ package.json not found"
    )


# ============================================================
# 6. RPC PROVIDER + CHAIN ID
# ============================================================

print()
print("=" * 80)
print("===== 6. BSC TESTNET NETWORK VERIFICATION =====")
print("=" * 80)

rpc_url = env.get(
    "RPC_URL",
    ""
)

network_ok = False

if rpc_url:

    node_script = r"""
const { JsonRpcProvider } = require("ethers");

(async () => {
    const provider = new JsonRpcProvider(process.env.CABLINK_RPC_URL);
    const network = await provider.getNetwork();

    console.log(JSON.stringify({
        chainId: network.chainId.toString(),
        name: network.name
    }));
})().catch(error => {
    console.error(error.message);
    process.exit(1);
});
"""

    try:

        result = subprocess.run(
            [
                "node",
                "-e",
                node_script
            ],
            env={
                **__import__("os").environ,
                "CABLINK_RPC_URL": rpc_url
            },
            capture_output=True,
            text=True
        )

        if result.returncode == 0:

            data = json.loads(
                result.stdout.strip()
            )

            chain_id = data.get(
                "chainId"
            )

            print(
                "  Chain ID:",
                chain_id
            )

            if chain_id == "97":

                network_ok = True

                print(
                    "  ✅ Connected to BSC Testnet"
                )

            else:

                print(
                    "  ❌ Wrong network"
                )

        else:

            print(
                "  ❌ Network verification failed:",
                result.stderr.strip()
            )

    except Exception as error:

        print(
            "  ❌ Network verification error:",
            error
        )

else:

    print(
        "  ❌ RPC_URL missing"
    )


# ============================================================
# 7. CONTRACT CODE + ERC20 INTERFACE PROBE
# ============================================================

print()
print("=" * 80)
print("===== 7. THB CONTRACT INTERFACE PROBE =====")
print("=" * 80)

contract_code_ok = False
contract_interface_ok = False

if (
    ethers_available
    and network_ok
    and contract_valid
):

    node_script = r"""
const {
    JsonRpcProvider,
    Contract
} = require("ethers");

(async () => {

    const provider =
        new JsonRpcProvider(
            process.env.CABLINK_RPC_URL
        );

    const address =
        process.env.CABLINK_CONTRACT;

    const code =
        await provider.getCode(
            address
        );

    const contract =
        new Contract(
            address,
            [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)",
                "function totalSupply() view returns (uint256)"
            ],
            provider
        );

    let result = {
        bytecode: code !== "0x",
        name: null,
        symbol: null,
        decimals: null,
        totalSupply: null
    };

    if (result.bytecode) {

        try {
            result.name =
                await contract.name();
        } catch {}

        try {
            result.symbol =
                await contract.symbol();
        } catch {}

        try {
            result.decimals =
                Number(
                    await contract.decimals()
                );
        } catch {}

        try {
            result.totalSupply =
                (
                    await contract.totalSupply()
                ).toString();
        } catch {}

    }

    console.log(
        JSON.stringify(result)
    );

})().catch(error => {

    console.error(
        error.message
    );

    process.exit(1);

});
"""

    try:

        result = subprocess.run(
            [
                "node",
                "-e",
                node_script
            ],
            env={
                **__import__("os").environ,
                "CABLINK_RPC_URL": rpc_url,
                "CABLINK_CONTRACT": contract
            },
            capture_output=True,
            text=True
        )

        if result.returncode == 0:

            data = json.loads(
                result.stdout.strip()
            )

            if data.get("bytecode"):

                contract_code_ok = True

                print(
                    "  ✅ Contract bytecode exists"
                )

            else:

                print(
                    "  ❌ Contract has no bytecode"
                )

            print(
                "  Token name:",
                data.get("name")
            )

            print(
                "  Token symbol:",
                data.get("symbol")
            )

            print(
                "  Token decimals:",
                data.get("decimals")
            )

            print(
                "  Total supply:",
                data.get("totalSupply")
            )

            if (
                data.get("symbol")
                or data.get("name")
                or data.get("decimals") is not None
            ):

                contract_interface_ok = True

                print(
                    "  ✅ ERC-20-style read interface detected"
                )

            else:

                print(
                    "  ⚠️ Standard ERC-20 read interface not confirmed"
                )

        else:

            print(
                "  ❌ Contract interface probe failed:",
                result.stderr.strip()
            )

    except Exception as error:

        print(
            "  ❌ Contract probe error:",
            error
        )

else:

    print(
        "  ⚪ Contract interface probe skipped"
    )


# ============================================================
# 8. TREASURY WALLET DERIVATION
# ============================================================

print()
print("=" * 80)
print("===== 8. TREASURY WALLET / PRIVATE KEY CONSISTENCY =====")
print("=" * 80)

treasury_match = False

if (
    ethers_available
    and private_key_valid
    and treasury_address_valid
):

    node_script = r"""
const { Wallet } = require("ethers");

try {

    const wallet =
        new Wallet(
            process.env.CABLINK_PRIVATE_KEY
        );

    console.log(
        wallet.address
    );

} catch (error) {

    console.error(
        error.message
    );

    process.exit(1);

}
"""

    try:

        result = subprocess.run(
            [
                "node",
                "-e",
                node_script
            ],
            env={
                **__import__("os").environ,
                "CABLINK_PRIVATE_KEY": private_key
            },
            capture_output=True,
            text=True
        )

        if result.returncode == 0:

            derived_address = (
                result.stdout.strip()
            )

            if (
                derived_address.lower()
                == treasury_wallet.lower()
            ):

                treasury_match = True

                print(
                    "  ✅ Private key derives the configured treasury wallet"
                )

            else:

                print(
                    "  ❌ Private key does NOT match configured treasury wallet"
                )

                print(
                    "  Derived address:",
                    derived_address
                )

                print(
                    "  Configured address:",
                    treasury_wallet
                )

        else:

            print(
                "  ❌ Private key could not be parsed"
            )

    except Exception as error:

        print(
            "  ❌ Treasury consistency check failed:",
            error
        )

else:

    print(
        "  ⚪ Treasury consistency check skipped"
    )


# ============================================================
# 9. TREASURY BNB BALANCE
# ============================================================

print()
print("=" * 80)
print("===== 9. TREASURY BNB GAS BALANCE =====")
print("=" * 80)

treasury_balance_ok = False

if (
    ethers_available
    and network_ok
    and treasury_address_valid
):

    node_script = r"""
const {
    JsonRpcProvider,
    formatEther
} = require("ethers");

(async () => {

    const provider =
        new JsonRpcProvider(
            process.env.CABLINK_RPC_URL
        );

    const balance =
        await provider.getBalance(
            process.env.CABLINK_TREASURY
        );

    console.log(
        JSON.stringify({
            wei: balance.toString(),
            bnb: formatEther(balance)
        })
    );

})().catch(error => {

    console.error(
        error.message
    );

    process.exit(1);

});
"""

    try:

        result = subprocess.run(
            [
                "node",
                "-e",
                node_script
            ],
            env={
                **__import__("os").environ,
                "CABLINK_RPC_URL": rpc_url,
                "CABLINK_TREASURY": treasury_wallet
            },
            capture_output=True,
            text=True
        )

        if result.returncode == 0:

            data = json.loads(
                result.stdout.strip()
            )

            print(
                "  Treasury BNB:",
                data.get("bnb")
            )

            if int(data.get("wei", "0")) > 0:

                treasury_balance_ok = True

                print(
                    "  ✅ Treasury has BNB available for gas"
                )

            else:

                print(
                    "  ❌ Treasury has zero BNB"
                )

        else:

            print(
                "  ❌ Treasury balance probe failed:",
                result.stderr.strip()
            )

    except Exception as error:

        print(
            "  ❌ Treasury balance check error:",
            error
        )

else:

    print(
        "  ⚪ Treasury balance check skipped"
    )


# ============================================================
# 10. PENDING REWARD DESTINATION VALIDITY
# ============================================================

print()
print("=" * 80)
print("===== 10. PENDING REWARD DESTINATION CHECK =====")
print("=" * 80)

ledger_file = (
    ROOT /
    "backend" /
    "data" /
    "economy_ledger.json"
)

pending_rewards = []

if ledger_file.exists():

    ledger = json.loads(
        ledger_file.read_text(
            encoding="utf-8"
        )
    )

    pending_rewards = [
        tx
        for tx in ledger.get(
            "transactions",
            []
        )
        if (
            tx.get("type")
            == "THB_REWARD"
            and tx.get("status")
            == "PENDING"
        )
    ]

print(
    "  Pending canonical rewards:",
    len(pending_rewards)
)

valid_pending_wallets = 0

for tx in pending_rewards:

    wallet = str(
        tx.get("wallet") or ""
    )

    valid = bool(
        re.fullmatch(
            evm_pattern,
            wallet
        )
    )

    print()
    print(
        "  Transaction:",
        tx.get("id")
    )

    print(
        "  rideId:",
        tx.get("rideId")
    )

    print(
        "  Amount:",
        tx.get("amount"),
        tx.get("token")
    )

    print(
        "  Wallet format valid:",
        "YES" if valid else "NO"
    )

    if valid:

        valid_pending_wallets += 1

        print(
            "  ✅ Valid EVM destination"
        )

    else:

        print(
            "  ❌ Invalid EVM destination"
        )


# ============================================================
# 11. FINAL VERDICT
# ============================================================

print()
print("=" * 80)
print("===== STAGE 4G FINAL PREFLIGHT VERDICT =====")
print("=" * 80)

checks = {
    "ETHERS_RUNTIME_AVAILABLE":
        ethers_available,

    "ETHERS_DECLARED":
        ethers_declared,

    "BSC_TESTNET_NETWORK":
        network_ok,

    "CONTRACT_BYTECODE":
        contract_code_ok,

    "CONTRACT_INTERFACE":
        contract_interface_ok,

    "PRIVATE_KEY_CONFIGURED":
        private_key_valid,

    "TREASURY_WALLET_VALID":
        treasury_address_valid,

    "TREASURY_KEY_MATCH":
        treasury_match,

    "TREASURY_HAS_GAS":
        treasury_balance_ok,

    "PENDING_REWARD_EXISTS":
        len(pending_rewards) > 0,

    "PENDING_DESTINATION_VALID":
        len(pending_rewards) > 0
        and valid_pending_wallets
        == len(pending_rewards)
}

for name, passed in checks.items():

    print(
        "  " +
        ("✅ " if passed else "❌ ") +
        name
    )

print()

if all(checks.values()):

    print(
        "🎯 STAGE 4G PASSED"
    )

    print()
    print(
        "Blockchain settlement prerequisites are verified."
    )

    print()
    print(
        "NEXT STEP: STAGE 4H CONTROLLED SETTLEMENT"
    )

    print(
        "No transaction has been sent by this preflight."
    )

else:

    print(
        "⚠️ STAGE 4G BLOCKED"
    )

    print()
    print(
        "Resolve the failed checks before any blockchain settlement."
    )

print()
print("=" * 80)
print("STAGE 4G COMPLETE")
print("=" * 80)

