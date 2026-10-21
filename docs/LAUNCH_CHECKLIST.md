# CabLink launch checklist

"Launch" means two different things. Do the first before the second.

## A. Controlled pilot (20-50 people you know) - ready now
- [x] Rider, driver and admin journeys work end to end on real data (tests/e2e.test.js)
- [x] Server authorises every action; fares, fees and rewards are calculated on the server
- [x] Driver approval + vehicle verification; one ride per rider, one job per driver
- [x] Push alerts configured; sound + keep-awake fallback; Digital Mall deliveries reach drivers
- [x] Fee ledger, pilot dashboard, app-error reports, announcements, help and SOS
- [ ] YOU: set SUPPORT_PHONE and SUPPORT_WHATSAPP in Vercel (shown in Help and SOS)
- [ ] YOU: phone every driver applicant, check licence + vehicle permit + insurance, then approve
- [ ] YOU: take 3-4 real routes and compare the app fare with local taxi prices; adjust FUEL_PRICE_BWP or tell me the gap
- [ ] YOU: run 10 real rides with 2-3 drivers; read the admin "App errors" tab afterwards
- [ ] YOU: test on a Huawei phone: does a push arrive with the app closed?

## B. Public launch - what is still missing
| Item | Why | Owner |
|---|---|---|
| SMS phone verification | Anyone can register any phone number | You: SMS provider account. Me: build the flow |
| Paid hosting plans | Vercel Hobby is for non-commercial use; free Supabase projects can pause when idle | You: check current plan terms before charging fares |
| Database backups | A mistake or outage must not lose rides, fees or accounts | You: enable backups; I can add a nightly export |
| Atomic status updates | Simultaneous cancel + arrive can overwrite each other | Me: one database function |
| Query by status, not whole table | Cost and speed once rides reach the thousands | Me |
| Play Store / AppGallery listing | Riders expect to find an app; AppGallery matters on Huawei | Me: package with PWABuilder; You: developer accounts |
| Terms + privacy reviewed by a lawyer | Current text is a plain-language pilot version | You |
| Digital Mall status webhook | Shop is not told about delivery progress | You: give MARKETPLACE_WEBHOOK_URL; Me: verify the payload |
| Remove unused Firebase variables | Unused credentials are unneeded risk | You |
