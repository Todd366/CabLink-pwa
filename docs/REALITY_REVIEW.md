# Reality review (pilot readiness)

Method: the real backend was run end to end with real storage (no mocks) and attacked; the real app was driven in a
browser against it (rider, driver, admin). `tests/e2e.test.js` keeps these checks permanent.

## Fixed in this review
| Finding | Fix |
|---|---|
| Rider could stack unlimited open requests | One live ride per rider (409 with the live ride's id; app jumps to it) |
| Driver could hold two jobs | One active job per driver |
| Driver cancelling killed the rider's request | Request returns to other drivers; that driver is excluded |
| Driver who accepts and never arrives stuck the rider forever | Released after 30 min (ASSIGN_TIMEOUT_MIN) |
| A trip stuck mid-ride could never be closed | Admin can force-close; riders/drivers cannot cancel once in the car |
| Reward/application/driver IDs built from the clock alone (same-millisecond collisions overwrite records) | Collision-proof IDs |
| Unverified cars could take rides | Vehicle must be VERIFIED (REQUIRE_VERIFIED_VEHICLE=false to override) |
| Empty number-plate chip | Plate captured separately and shown only if present |
| "Today" and daily charts used the UTC day | Botswana local day (UTC+2) |
| Phantom online drivers inflated counts | Presence freshness (10 min counts, 6 h alerts) |
| Drivers missed requests on phones without push | Screen stays awake + sound/vibration on new requests |

## Open risks (ranked)
1. **PIN-only accounts, no phone verification.** Anyone can register someone else's number. Admin must phone each
   driver applicant before approving. SMS verification is the fix (needs an SMS provider account).
2. **Read-modify-write updates.** Accepting a ride is atomic in production (database function with row lock), but other
   transitions are not: a rider cancel and a driver "arrived" at the same instant can overwrite each other.
   Fix: one more database function that updates only if the status is still what the caller saw.
3. **Every poll loads the whole ride table.** Fine for hundreds of rides; slow and costly at thousands.
   Fix: query by status in the database, and rely on push instead of polling.
4. **Web push depends on Google services.** Huawei phones without Google services may never receive pushes. The
   screen-awake + sound fallback covers drivers; riders see updates while the app is open.
5. **Tariff is calculated, not observed.** Compare against real local taxi prices for 3-4 routes before launch.
6. **Distances are estimates** (village centres x road factor). Fares for villages may differ from what drivers expect.
7. **Digital Mall:** MARKETPLACE_WEBHOOK_URL is not set, so the shop is never told about delivery progress.
   ELOS_INGEST_KEY is not set either.
8. **Leftover credentials:** Firebase variables exist in production but rides, accounts and rewards live in Supabase.
9. **Operations, not code:** check drivers hold valid taxi/PSV permits and insurance; set a way for riders to reach CabLink.
