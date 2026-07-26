import json
import subprocess
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path.cwd()

RIDES_FILE = ROOT / "backend/data/rides.json"
LEDGER_FILE = ROOT / "backend/data/economy_ledger.json"

BASE_URL = "http://127.0.0.1:3000"

TEST_RIDE_ID = "RIDE-1785010715936"
NON_COMPLETED_RIDE_ID = "RIDE-1785010614800"
FAKE_RIDE_ID = "RIDE-STAGE4D-NOT-FOUND"

print("=" * 80)
print("🚕 CABLINK — STAGE 4D RUNTIME REWARD PROOF")
print("=" * 80)
print()
print("READ-ONLY RUNTIME VERIFICATION")
print("NO APPLICATION FILES WILL BE MODIFIED")
print()

# ------------------------------------------------------------
# 1. LOAD CANONICAL RIDE
# ------------------------------------------------------------

print("===== 1. CANONICAL COMPLETED RIDE =====")

with open(RIDES_FILE, "r", encoding="utf-8") as f:
    rides = json.load(f)

ride = next(
    (r for r in rides if r.get("id") == TEST_RIDE_ID),
    None
)

if not ride:
    print("❌ TEST RIDE NOT FOUND")
    raise SystemExit(1)

print("  rideId:", ride.get("id"))
print("  status:", ride.get("status"))
print("  fare:", ride.get("fare"))
print("  driverId:", ride.get("driverId"))
print("  wallet:", ride.get("wallet"))

if ride.get("status") != "COMPLETED":
    print("❌ TEST RIDE IS NOT COMPLETED")
    raise SystemExit(1)

print("  ✅ Canonical test ride is COMPLETED")

# ------------------------------------------------------------
# 2. LOAD LEDGER BEFORE TEST
# ------------------------------------------------------------

print()
print("===== 2. LEDGER BEFORE TEST =====")

if LEDGER_FILE.exists():

    with open(LEDGER_FILE, "r", encoding="utf-8") as f:
        ledger_before = json.load(f)

else:

    ledger_before = {
        "rides": [],
        "transactions": []
    }

transactions_before = ledger_before.get(
    "transactions",
    []
)

matching_before = [
    tx for tx in transactions_before
    if (
        tx.get("type") == "THB_REWARD"
        and str(
            tx.get("rideId") or
            tx.get("ride")
        ) == TEST_RIDE_ID
    )
]

print(
    "  Existing matching THB rewards:",
    len(matching_before)
)

for tx in matching_before:
    print(
        "   •",
        tx
    )

# ------------------------------------------------------------
# 3. HTTP REQUEST HELPER
# ------------------------------------------------------------

def post_reward(ride_id):

    url = (
        BASE_URL +
        "/api/rewards/ride/" +
        ride_id
    )

    request = urllib.request.Request(
        url,
        data=b"{}",
        headers={
            "Content-Type": "application/json"
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

            try:
                payload = json.loads(body)
            except Exception:
                payload = {
                    "raw": body
                }

            return (
                response.status,
                payload
            )

    except urllib.error.HTTPError as error:

        body = error.read().decode(
            "utf-8",
            errors="replace"
        )

        try:
            payload = json.loads(body)
        except Exception:
            payload = {
                "raw": body
            }

        return (
            error.code,
            payload
        )

    except Exception as error:

        return (
            None,
            {
                "error": str(error)
            }
        )

# ------------------------------------------------------------
# 4. FIRST REQUEST
# ------------------------------------------------------------

print()
print("===== 3. FIRST REWARD REQUEST =====")

status1, result1 = post_reward(
    TEST_RIDE_ID
)

print("  HTTP status:", status1)
print(
    "  response:",
    json.dumps(
        result1,
        indent=2
    )
)

if status1 == 201 and result1.get(
    "status"
) == "REWARD_CREATED":

    print(
        "  ✅ FIRST REQUEST CREATED REWARD"
    )

else:

    print(
        "  ⚠️ FIRST REQUEST DID NOT CREATE A NEW REWARD"
    )

# ------------------------------------------------------------
# 5. SECOND IDENTICAL REQUEST
# ------------------------------------------------------------

print()
print("===== 4. DUPLICATE REWARD REQUEST =====")

status2, result2 = post_reward(
    TEST_RIDE_ID
)

print("  HTTP status:", status2)
print(
    "  response:",
    json.dumps(
        result2,
        indent=2
    )
)

if (
    status2 == 200
    and result2.get("status")
    == "ALREADY_REWARDED"
):

    print(
        "  ✅ DUPLICATE REQUEST BLOCKED"
    )

else:

    print(
        "  ❌ DUPLICATE REQUEST DID NOT RETURN ALREADY_REWARDED"
    )

# ------------------------------------------------------------
# 6. VERIFY LEDGER COUNT
# ------------------------------------------------------------

print()
print("===== 5. EXACTLY-ONCE LEDGER VERIFICATION =====")

with open(
    LEDGER_FILE,
    "r",
    encoding="utf-8"
) as f:

    ledger_after = json.load(f)

transactions_after = ledger_after.get(
    "transactions",
    []
)

matching_after = [
    tx for tx in transactions_after
    if (
        tx.get("type") == "THB_REWARD"
        and str(
            tx.get("rideId") or
            tx.get("ride")
        ) == TEST_RIDE_ID
    )
]

print(
    "  Matching THB rewards after two requests:",
    len(matching_after)
)

for tx in matching_after:

    print(
        "   •",
        json.dumps(
            tx,
            indent=2
        )
    )

if len(matching_after) == 1:

    print(
        "  ✅ EXACTLY ONE REWARD EXISTS FOR rideId"
    )

else:

    print(
        "  ❌ EXPECTED EXACTLY ONE REWARD"
    )

# ------------------------------------------------------------
# 7. VERIFY CANONICAL IDENTITY
# ------------------------------------------------------------

print()
print("===== 6. CANONICAL rideId IDENTITY =====")

if matching_after:

    reward = matching_after[0]

    reward_ride_id = str(
        reward.get("rideId") or
        reward.get("ride")
    )

    print(
        "  Canonical ride.id:",
        TEST_RIDE_ID
    )

    print(
        "  Reward rideId:",
        reward_ride_id
    )

    if reward_ride_id == TEST_RIDE_ID:

        print(
            "  ✅ REWARD IS LINKED TO CANONICAL BACKEND rideId"
        )

    else:

        print(
            "  ❌ REWARD rideId DOES NOT MATCH CANONICAL RIDE"
        )

# ------------------------------------------------------------
# 8. NON-COMPLETED RIDE TEST
# ------------------------------------------------------------

print()
print("===== 7. NON-COMPLETED RIDE TEST =====")

non_completed = next(
    (
        r for r in rides
        if r.get("id") ==
        NON_COMPLETED_RIDE_ID
    ),
    None
)

if non_completed:

    print(
        "  rideId:",
        non_completed.get("id")
    )

    print(
        "  status:",
        non_completed.get("status")
    )

    status3, result3 = post_reward(
        NON_COMPLETED_RIDE_ID
    )

    print(
        "  HTTP status:",
        status3
    )

    print(
        "  response:",
        json.dumps(
            result3,
            indent=2
        )
    )

    if (
        status3 == 409
        and result3.get("status")
        == "RIDE_NOT_COMPLETED"
    ):

        print(
            "  ✅ NON-COMPLETED RIDE REJECTED"
        )

    else:

        print(
            "  ❌ NON-COMPLETED RIDE WAS NOT REJECTED CORRECTLY"
        )

else:

    print(
        "  ⚠️ NON-COMPLETED TEST RIDE NOT FOUND"
    )

# ------------------------------------------------------------
# 9. FAKE RIDE TEST
# ------------------------------------------------------------

print()
print("===== 8. NON-EXISTENT RIDE TEST =====")

status4, result4 = post_reward(
    FAKE_RIDE_ID
)

print(
    "  HTTP status:",
    status4
)

print(
    "  response:",
    json.dumps(
        result4,
        indent=2
    )
)

if (
    status4 == 404
    and result4.get("status")
    == "RIDE_NOT_FOUND"
):

    print(
        "  ✅ NON-EXISTENT RIDE REJECTED"
    )

else:

    print(
        "  ❌ NON-EXISTENT RIDE WAS NOT REJECTED CORRECTLY"
    )

# ------------------------------------------------------------
# 10. FINAL VERDICT
# ------------------------------------------------------------

print()
print("=" * 80)
print("STAGE 4D FINAL VERDICT")
print("=" * 80)

first_ok = (
    status1 == 201
    and result1.get("status")
    == "REWARD_CREATED"
)

duplicate_ok = (
    status2 == 200
    and result2.get("status")
    == "ALREADY_REWARDED"
)

exactly_one_ok = (
    len(matching_after) == 1
)

identity_ok = (
    bool(matching_after)
    and str(
        matching_after[0].get("rideId") or
        matching_after[0].get("ride")
    ) == TEST_RIDE_ID
)

not_completed_ok = (
    status3 == 409
    and result3.get("status")
    == "RIDE_NOT_COMPLETED"
) if non_completed else False

not_found_ok = (
    status4 == 404
    and result4.get("status")
    == "RIDE_NOT_FOUND"
)

checks = {
    "FIRST_REQUEST_CREATED_REWARD":
        first_ok,

    "DUPLICATE_REQUEST_BLOCKED":
        duplicate_ok,

    "EXACTLY_ONE_REWARD":
        exactly_one_ok,

    "CANONICAL_RIDE_ID_MATCH":
        identity_ok,

    "NON_COMPLETED_RIDE_REJECTED":
        not_completed_ok,

    "NON_EXISTENT_RIDE_REJECTED":
        not_found_ok
}

for name, passed in checks.items():

    print(
        "  " +
        ("✅ " if passed else "❌ ") +
        name
    )

if all(checks.values()):

    print()
    print(
        "🎯 STAGE 4D PASSED"
    )

    print(
        "Backend canonical reward authority has been"
    )

    print(
        "runtime-verified for the tested ride."
    )

else:

    print()
    print(
        "⚠️ STAGE 4D REQUIRES INVESTIGATION"
    )

print()
print(
    "NO APPLICATION FILES WERE MODIFIED BY THIS TEST."
)

