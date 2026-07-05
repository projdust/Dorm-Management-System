# Setup Guide

## 1. Install once

- Node.js (18+)
- PostgreSQL (or use Supabase — see note at bottom)
- Git

## 2. Clone the repo

```bash
git clone https://github.com/projdust/Dorm-Management-System.git
cd Dorm-Management-System
```

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in these 3 things:

DATABASE_URL=your-postgres-connection-string
JWT_ACCESS_SECRET=any-random-long-string
JWT_REFRESH_SECRET=a-different-random-long-string

(Everything else in `.env.example` can stay as-is.)

Then run these one at a time:
```bash
npx prisma migrate dev
npx prisma generate
node prisma/seed.js
npm run dev
```

Backend is working if you can open `http://localhost:5000/health` in a browser.

## 4. Frontend (open a second terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 5. Log in

Open `http://localhost:5173`. Log in with:
Email: admin@dorm.com
Password: Password123
# THIS IS THE DEFAULT ADMIN ACCOUNT

## If something breaks

- **CORS error in browser console** → in `backend/.env`, set `CLIENT_URL=http://localhost:5173`, then restart backend (`Ctrl+C`, `npm run dev` again — env changes need a restart)
- **Port already in use** → you have two backends running at once. Close the extra terminal.
- **Can't log in / "Invalid or expired token"** → clear browser storage (F12 → Application tab → Local Storage → clear), then log in again
- **Anything else** → copy the exact error text and ask for help with it

## Using Supabase instead of local Postgres

Get your connection string from Supabase's Connect page (use the **pooler** option, not the direct one). Paste it as both `DATABASE_URL` and `DIRECT_URL` in `.env`. Everything else is the same.

## Building a feature

Look at how **Rooms** is built (`backend/src/*/rooms/` and `frontend/src/features/rooms/`) — copy that pattern for whichever feature you're assigned.


## EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE
## EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE 
## EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE 
## EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE 
## EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE EYES HERE  


## ## ## ONLY AFTER MAKING CHANGES AND ALL FUNCTIONS ARE WORKING PROPERLY CAN COMMIT AND PUSH 