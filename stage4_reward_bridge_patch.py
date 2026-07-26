import os
import re
import shutil
import subprocess

ROOT = os.getcwd()

BRIDGE = "frontend/js/rides/completionRewardBridge.js"
BACKUP = BRIDGE + ".stage4.reward.bak"

print("=" * 80)
print("🚕 CABLINK — STAGE 4 REWARD BRIDGE EXACTLY-ONCE PATCH")
print("=" * 80)

# ============================================================
# 1. LOAD FILE
# ============================================================

bridge_path = os.path.join(ROOT, BRIDGE)

if not os.path.exists(bridge_path):
    print("❌ Reward bridge not found:")
    print("   " + bridge_path)
    raise SystemExit(1)

with open(bridge_path, "r", encoding="utf8") as f:
    original = f.read()

print("✅ Reward bridge loaded")

# ============================================================
# 2. BACKUP
# ============================================================

shutil.copy2(
    bridge_path,
    os.path.join(ROOT, BACKUP)
)

print("✅ Backup created:")
print("   " + BACKUP)

# ============================================================
# 3. PATCH COMPLETE RIDE FUNCTION
# ============================================================

patched = original

# Change:
# completeRide:function(){
#
# To:
# completeRide:function(rideId){

patched = patched.replace(
    "completeRide:function(){",
    "completeRide:function(rideId){",
    1
)

# ============================================================
# 4. INSERT RIDE-ID RESOLUTION + DUPLICATE GUARD
# ============================================================

marker = """
console.log(
"🚕 Ride completed - creating transaction"
);
"""

replacement = """
/*
 * Stage 4 exactly-once completion guard.
 *
 * The canonical lifecycle event supplies the backend ride ID.
 * The reward bridge uses that ride ID as the idempotency key.
 *
 * This prevents duplicate THB reward generation if:
 *
 * - the completion event fires twice
 * - the browser retries
 * - the lifecycle listener is registered more than once
 * - the user refreshes after completion
 */

var completedRideId =
  rideId ||
  (
    window.CABLINK_RIDE &&
    window.CABLINK_RIDE.id
  ) ||
  null;

if (!completedRideId) {

  try {

    var storedCompletedRide =
      localStorage.getItem(
        "cablink_last_completed_ride"
      );

    if (storedCompletedRide) {

      var parsedCompletedRide =
        JSON.parse(
          storedCompletedRide
        );

      completedRideId =
        parsedCompletedRide &&
        parsedCompletedRide.id
          ? parsedCompletedRide.id
          : null;
    }

  } catch (resolveError) {

    console.warn(
      "CabLink reward bridge could not resolve ride ID:",
      resolveError
    );
  }
}

if (!completedRideId) {

  console.warn(
    "CabLink reward bridge skipped completion: missing ride ID"
  );

  return;
}

var rewardCompletionKey =
  "cablink_reward_completed_" +
  String(completedRideId);

if (
  localStorage.getItem(
    rewardCompletionKey
  )
) {

  console.log(
    "🚫 THB reward already generated for ride:",
    completedRideId
  );

  return;
}

console.log(
  "🚕 Ride completed - creating transaction:",
  completedRideId
);
"""

if marker not in patched:

    print(
        "❌ Expected completion transaction marker not found."
    )

    print(
        "No changes were written."
    )

    raise SystemExit(1)

patched = patched.replace(
    marker,
    replacement,
    1
)

# ============================================================
# 5. ENSURE GENERATED RIDE CONTAINS THE CANONICAL RIDE ID
# ============================================================

patched = re.sub(
    r'(\bid\s*:\s*)([^,\n]+)',
    r'\1completedRideId',
    patched,
    count=1
)

# ============================================================
# 6. ADD EXACTLY-ONCE MARKER AFTER SUCCESSFUL REWARD CREATION
# ============================================================

reward_event_marker = """
window.dispatchEvent(

new CustomEvent(
"cablinkRewardCreated",
"""

if reward_event_marker not in patched:

    print(
        "❌ Expected reward creation event marker not found."
    )

    print(
        "No changes were written."
    )

    raise SystemExit(1)

# Insert marker immediately before reward event dispatch.
patched = patched.replace(
    reward_event_marker,
    """
/*
 * Mark this ride as reward-completed only after
 * the reward record has been created successfully.
 */
localStorage.setItem(
  rewardCompletionKey,
  new Date().toISOString()
);

window.dispatchEvent(

new CustomEvent(
"cablinkRewardCreated",
""",
    1
)

# ============================================================
# 7. PASS RIDE ID FROM LIFECYCLE EVENT
# ============================================================

listener_old = """
window.CABLINK_FINANCE.completeRide();
"""

listener_new = """
window.CABLINK_FINANCE.completeRide(
  e.detail.rideId
);
"""

if listener_old not in patched:

    print(
        "❌ Existing completion listener call not found."
    )

    print(
        "No changes were written."
    )

    raise SystemExit(1)

patched = patched.replace(
    listener_old,
    listener_new,
    1
)

# ============================================================
# 8. WRITE PATCH
# ============================================================

if patched == original:

    print(
        "❌ Patch produced no changes."
    )

    raise SystemExit(1)

with open(
    bridge_path,
    "w",
    encoding="utf8"
) as f:

    f.write(patched)

print("✅ completionRewardBridge.js patched")

# ============================================================
# 9. STATIC VERIFICATION
# ============================================================

print("\n" + "=" * 80)
print("STATIC VERIFICATION")
print("=" * 80)

checks = {

    "completeRide accepts rideId":
        "completeRide:function(rideId){" in patched,

    "Canonical event supplies rideId":
        "completeRide(\n  e.detail.rideId\n)" in patched,

    "Duplicate key exists":
        "cablink_reward_completed_" in patched,

    "Duplicate guard exists":
        "localStorage.getItem(\n    rewardCompletionKey" in patched,

    "Missing ride ID is rejected":
        "missing ride ID" in patched,

    "Reward marker written":
        "localStorage.setItem(\n  rewardCompletionKey" in patched,

    "Reward event remains":
        "cablinkRewardCreated" in patched,

    "Completion state listener remains":
        'e.detail.state==="COMPLETED"' in patched,

    "Canonical ride ID used":
        "id: completedRideId" in patched,

}

failed = []

for name, result in checks.items():

    if result:
        print("  ✅ " + name)

    else:
        print("  ❌ " + name)
        failed.append(name)

# ============================================================
# 10. JAVASCRIPT SYNTAX CHECK
# ============================================================

print("\n" + "=" * 80)
print("JAVASCRIPT SYNTAX CHECK")
print("=" * 80)

result = subprocess.run(
    [
        "node",
        "--check",
        bridge_path
    ],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

if result.returncode == 0:

    print(
        "  ✅ " + BRIDGE
    )

else:

    print(
        "  ❌ Syntax error: " + BRIDGE
    )

    print(
        result.stderr
    )

    failed.append(
        "Syntax: " + BRIDGE
    )

# ============================================================
# 11. FINAL RESULT
# ============================================================

print("\n" + "=" * 80)

if failed:

    print(
        "❌ STAGE 4 REWARD BRIDGE PATCH FAILED"
    )

    print("\nFailed checks:")

    for item in failed:
        print(
            "  - " + item
        )

    print("\nBackup remains available:")
    print(
        "  " + BACKUP
    )

    raise SystemExit(1)

print(
    "✅ STAGE 4 REWARD BRIDGE PATCH PASSED"
)

print("=" * 80)

print("""
PATCH RESULT:

Backend COMPLETED
    ↓
Frontend cablinkRideStateChanged
    ↓
detail.rideId
    ↓
completionRewardBridge.completeRide(rideId)
    ↓
cablink_reward_completed_<rideId>
    ↓
Duplicate guard
    ↓
THB reward creation
    ↓
Reward completion marker
    ↓
cablinkRewardCreated

EXACTLY-ONCE GUARANTEE:

Same ride ID
    → second completion event
    → duplicate key found
    → reward creation skipped

NEXT STEP:

Do NOT run the full lifecycle test yet.

First inspect this patch output.

If it passes:

1. Restart backend.
2. Verify GET /api/rides.
3. Create ONE fresh test ride.
4. Execute the lifecycle one transition at a time.
5. Confirm each PATCH succeeds.
6. Complete the ride.
7. Verify exactly ONE reward record.
8. Repeat the completion event deliberately.
9. Verify NO second reward is generated.
10. Verify backend/data/rides.json.
""")

