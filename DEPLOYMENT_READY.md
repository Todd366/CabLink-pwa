
# CabLink Deployment

Frontend:
- Vite PWA
- Environment:
  VITE_CABLINK_API_URL

Backend:
- Node Express
- Start:
  npm start

Required:
- HTTPS backend URL
- Production environment variables
- Database persistence

Ride lifecycle verified:

CREATE
↓
DISPATCH
↓
ACCEPT
↓
READ
↓
COMPLETE

