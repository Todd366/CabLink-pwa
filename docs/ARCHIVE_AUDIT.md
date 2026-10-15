# Archive audit: what was reused, what was not

Full inventory of the repository (1,979 files; 1,695 in `archive/`). The live server
reaches 44 backend files; the other 27 are backups. Everything below is from the
pre-cleanup tree (`archive/before_architecture_cleanup`).

## Integrated (real business rules or working ideas)
| Source | Now |
|---|---|
| delivery_fare_engine (P20 + P5/km, 80/20 split) | Server + app delivery pricing, driver earnings on request cards |
| bstm_links (7 ecosystem apps) | In-app BSTM ecosystem screen |
| UpdatesCenter + cablink_updates.json | Announcements: admin posts, riders/drivers see (durable storage) |
| driver_matching_service (nearest driver) | Open requests sorted by distance to the driver; riders see drivers online |
| driver_intelligence (rating, experience) | Driver rating and leaderboard from real rides |
| passenger_intelligence (rides, spent) | Rider trip and spend summary |
| ticket_system | Help and report a problem, handled in the admin Safety tab |
| trust/safety/incident ideas | Existing incident store, SUPPORT type added |
| marketplace_bridge / task_manager | Already live through the marketplace endpoints (delivery rides) |

## Reviewed and deliberately NOT integrated
| Module | Why |
|---|---|
| sms_engine, otp_service, phone_verification_engine | Stubs: `verify` returns true for any code. A real SMS provider is needed first. |
| ride_validation, reward_guard, fraud_engine | One-line checks; server-side authorization now covers this properly. |
| trust_engine | Static scoring formula with no data behind it; leaderboard and ratings replace it. |
| payments/* | Placeholders with no provider. See payment plan. |
| socket/*, realtime/* | Need a persistent server; the app uses polling and push on Vercel. |
| simulation_engine, fake driver chat, fake negotiation | Fake data. Removed on purpose. |
| *_test / phase* scripts | Historical scripts; real tests are in `tests/`. |
