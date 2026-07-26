import os
import re
from pathlib import Path

ROOT = Path.cwd()

print("=" * 80)
print("🚕 CABLINK — STAGE 4B BACKEND REWARD PERSISTENCE AUDIT")
print("=" * 80)

# ------------------------------------------------------------
# 1. FIND BACKEND FILES
# ------------------------------------------------------------

print("\n===== BACKEND FILE DISCOVERY =====")

backend_candidates = []

for pattern in [
    "backend/**/*.js",
    "server/**/*.js",
    "api/**/*.js",
    "*.js"
]:
    for path in ROOT.glob(pattern):
        if path.is_file():
            backend_candidates.append(path)

backend_candidates = sorted(set(backend_candidates))

for path in backend_candidates:
    print("  •", path.relative_to(ROOT))

# ------------------------------------------------------------
# 2. SEARCH FOR REWARD / RIDE / COMPLETION LOGIC
# ------------------------------------------------------------

print("\n===== REWARD / RIDE / COMPLETION REFERENCES =====")

keywords = [
    "reward",
    "rewards",
    "THBReward",
    "rideId",
    "rides.json",
    "COMPLETED",
    "transaction",
    "idempot",
    "rewardCompletion"
]

matches = []

for path in backend_candidates:

    try:
        text = path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception:
        continue

    lines = text.splitlines()

    for number, line in enumerate(lines, 1):

        if any(
            keyword.lower() in line.lower()
            for keyword in keywords
        ):

            matches.append(
                (
                    path,
                    number,
                    line.strip()
                )
            )

for path, number, line in matches:

    print(
        f"{path.relative_to(ROOT)}:{number}: {line}"
    )

# ------------------------------------------------------------
# 3. SEARCH DATA FILES
# ------------------------------------------------------------

print("\n===== DATA FILES =====")

data_files = []

for pattern in [
    "backend/**/*.json",
    "data/**/*.json",
    "*.json"
]:

    for path in ROOT.glob(pattern):

        if path.is_file():

            data_files.append(path)

for path in sorted(set(data_files)):

    print(
        "  •",
        path.relative_to(ROOT)
    )

# ------------------------------------------------------------
# 4. INSPECT RELEVANT JSON STRUCTURES
# ------------------------------------------------------------

print("\n===== RELEVANT JSON CONTENT =====")

for path in sorted(set(data_files)):

    name = path.name.lower()

    if any(
        token in name
        for token in [
            "ride",
            "reward",
            "transaction"
        ]
    ):

        print(
            f"\n--- {path.relative_to(ROOT)} ---"
        )

        try:

            text = path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            print(
                text[:12000]
            )

        except Exception as e:

            print(
                "ERROR:",
                e
            )

# ------------------------------------------------------------
# 5. LOOK FOR BACKEND ROUTES
# ------------------------------------------------------------

print("\n===== POSSIBLE BACKEND ROUTES =====")

route_patterns = [
    r'app\.(get|post|put|patch|delete)\s*\(',
    r'router\.(get|post|put|patch|delete)\s*\(',
    r'\.patch\s*\(',
    r'\.post\s*\('
]

for path in backend_candidates:

    try:

        text = path.read_text(
            encoding="utf-8",
            errors="ignore"
        )

    except Exception:

        continue

    for pattern in route_patterns:

        for match in re.finditer(
            pattern,
            text,
            re.IGNORECASE
        ):

            line_number = (
                text[:match.start()].count("\n") + 1
            )

            print(
                f"{path.relative_to(ROOT)}:{line_number}: "
                f"{match.group(0)}"
            )

# ------------------------------------------------------------
# 6. AUDIT QUESTIONS
# ------------------------------------------------------------

print("\n" + "=" * 80)
print("AUDIT TARGET")
print("=" * 80)

print("""
We need to establish these facts:

1. Where is the backend ride created?
2. What field is the canonical backend ride ID?
3. Where is the ride transitioned to COMPLETED?
4. Does the COMPLETED response/event contain rideId?
5. Where is the THB reward record created?
6. Does the reward record contain the same rideId?
7. Does the backend enforce one reward per rideId?
8. Is there a backend idempotency mechanism?
9. Is rewards.json / transactions.json / database persistence involved?
10. Can a duplicate completion request create a second reward?

NO FILES WERE MODIFIED BY THIS AUDIT.
""")

