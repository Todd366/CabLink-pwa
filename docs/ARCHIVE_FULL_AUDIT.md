# Full archive audit (every file)

Method: all 1,695 files in `archive/` were fingerprinted (SHA-1), de-duplicated, and every route, function name,
SQL table and screen label was extracted and diffed against the live code.

| Measure | Result |
|---|---|
| Files in archive | 1,695 (19.9 MB) |
| Unique contents | 1,605 (90 exact duplicates) |
| Identical to a file that is live today | 43 |
| Named backups / snapshots | most of the rest (old_backups 757, before_architecture_cleanup 329, phase_scripts 284, legacy_root_scripts 264) |
| Unique source files analysed | 777 |
| Old-app screen labels not present in the new app | 49 |
| Documents | mostly machine-generated audit printouts and copies of third-party library readmes |

## Old features that were REAL and are now integrated
Delivery tariff and 80/20 split; BSTM ecosystem links; announcements; nearest-first dispatch ordering; driver rating
and leaderboard; help tickets; live ETA; support contact; fee settlement ledger; THB Rewards screen (received,
pending, streak, referrals, claim); live trip-share link; extra stops.

## Old features that were FAKE (browser-only) and were not copied
Daily +0.5 THB bonus (it only changed a number saved in the browser), driver chat, fare negotiation animation,
"nearby drivers" map dots, simulated driver movement, confetti-only completion, surge banner.

## Needs a decision before it is built
| Feature | Why it needs a decision |
|---|---|
| Daily THB bonus | Real payouts + open sign-up = anyone can farm it with fake accounts. Needs SMS verification first. |
| Fare negotiation (rider offers, driver counters) | A pricing-policy change; changes how fees and rewards are computed. |
| Surge pricing | Raises prices on riders; needs a policy and a visible, capped multiplier. |
| Driver/rider mode toggle | Explicitly rejected earlier (separate accounts by design). |
| In-app chat | Calling and WhatsApp already work; chat adds moderation duties. |

## Defects found in the archive-era money code and fixed
Reward claims could pay several times if sent at the same instant (now exactly once, enforced by the database).
Reward and referral payouts share the same guard. A ride reward ID could collide (now collision-proof).
