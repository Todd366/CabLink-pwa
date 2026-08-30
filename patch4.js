const fs = require('fs');
const path = require('path');

function replaceOnce(content, oldStr, newStr, label) {
  const idx = content.indexOf(oldStr);

  if (idx === -1) {
    console.error('❌ Could not find anchor for: ' + label);
    process.exitCode = 1;
    return content;
  }

  return content.slice(0, idx) +
    newStr +
    content.slice(idx + oldStr.length);
}


/* ============================================================
   1. FIX CANONICAL REWARD API ASYNC BUG
   ============================================================ */

const rewardApiPath =
  path.join('backend', 'routes', 'canonical_reward_api.js');

let rewardApi =
  fs.readFileSync(rewardApiPath, 'utf8');

rewardApi = replaceOnce(
  rewardApi,

  `            const result =
                rewardService
                    .createRewardForCompletedRide(
                        req.params.rideId
                    );`,

  `            const result =
                await rewardService
                    .createRewardForCompletedRide(
                        req.params.rideId
                    );`,

  'canonical reward await'
);

fs.writeFileSync(
  rewardApiPath,
  rewardApi,
  'utf8'
);

console.log(
  '✅ canonical_reward_api.js async reward call fixed'
);


/* ============================================================
   2. MAKE LEADERBOARD UNDERSTAND BOTH LEDGER SCHEMAS
   ============================================================ */

const leaderboardPath =
  path.join('backend', 'routes', 'leaderboard_api.js');

let leaderboard =
  fs.readFileSync(leaderboardPath, 'utf8');


leaderboard = replaceOnce(
  leaderboard,

  `    for (const tx of ledger.transactions || []) {
        if (!tx || tx.type !== "THB_REWARD" || !tx.driverId) continue;

        if (!byDriver[tx.driverId]) {
            byDriver[tx.driverId] = { driverId: tx.driverId, rides: 0, thb: 0 };
        }

        byDriver[tx.driverId].rides += 1;
        byDriver[tx.driverId].thb += Number(tx.amount) || 0;
    }`,

  `    for (const tx of ledger.transactions || []) {
        if (!tx || tx.type !== "THB_REWARD") continue;

        // Historical ledger records used "driver" and "ride".
        // Canonical records use "driverId" and "rideId".
        // Read both without rewriting historical data.
        const driverId =
            tx.driverId ||
            tx.driver ||
            null;

        if (!driverId) continue;

        if (!byDriver[driverId]) {
            byDriver[driverId] = {
                driverId,
                rides: 0,
                thb: 0
            };
        }

        byDriver[driverId].rides += 1;
        byDriver[driverId].thb += Number(tx.amount) || 0;
    }`,

  'leaderboard ledger normalization'
);


/*
 * Use account name when available, otherwise fall back to
 * a useful driver identity. This does not create fake accounts.
 */

leaderboard = replaceOnce(
  leaderboard,

  `            const account = (accountsData.accounts || []).find(a => a.id === entry.driverId);
            return {
                name: account ? account.name : (entry.driverId.length > 10
                    ? entry.driverId.slice(0, 8) + "…"
                    : entry.driverId),`,

  `            const account = (accountsData.accounts || [])
                .find(a => String(a.id) === String(entry.driverId));

            return {
                name: account
                    ? account.name
                    : (entry.driverId.length > 10
                        ? entry.driverId.slice(0, 8) + "…"
                        : entry.driverId),`,

  'leaderboard account identity'
);


fs.writeFileSync(
  leaderboardPath,
  leaderboard,
  'utf8'
);

console.log(
  '✅ leaderboard now supports legacy + canonical driver identities'
);


/* ============================================================
   3. MAKE DRIVER ECONOMY READ BOTH DRIVER FIELD NAMES
   ============================================================ */

const economyPath =
  path.join(
    'backend',
    'services',
    'economy_ledger_service.js'
  );

let economy =
  fs.readFileSync(economyPath, 'utf8');


economy = replaceOnce(
  economy,

  `const rides=db.rides.filter(
r=>r.driverId===driver
);

const transactions=db.transactions.filter(
t=>t.driverId===driver
);`,

  `const rides=db.rides.filter(
r=>(
    r.driverId===driver ||
    r.driver===driver
)
);

const transactions=db.transactions.filter(
t=>(
    t.driverId===driver ||
    t.driver===driver
)
);`,

  'driver economy legacy identity'
);


economy = replaceOnce(
  economy,

  `rides:
db.rides.filter(
r=>r.driverId===driver
),

transactions:
db.transactions.filter(
t=>t.driverId===driver
)`,

  `rides:
db.rides.filter(
r=>(
    r.driverId===driver ||
    r.driver===driver
)
),

transactions:
db.transactions.filter(
t=>(
    t.driverId===driver ||
    t.driver===driver
)
)`,

  'driver history legacy identity'
);


fs.writeFileSync(
  economyPath,
  economy,
  'utf8'
);

console.log(
  '✅ economy ledger service now supports legacy + canonical driver identities'
);


/* ============================================================
   4. SYNTAX CHECK
   ============================================================ */

const files = [
  rewardApiPath,
  leaderboardPath,
  economyPath
];

for (const file of files) {
  try {
    require('./' + file);
    console.log('✅ syntax/load OK:', file);
  } catch (error) {
    console.error('❌ syntax/load FAILED:', file);
    console.error(error.message);
    process.exitCode = 1;
  }
}

console.log('');
console.log('Patch 4 complete.');
console.log('Restart backend before testing.');
