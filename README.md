# Moveo AI Crypto Advisor

A personalized crypto-investor dashboard, built for the Moveo coding
assignment. Users create an account, complete a short onboarding
questionnaire, and get a daily dashboard with market news, coin prices, one
AI-generated insight per day, and a crypto meme - each section can be voted
thumbs up/down.

> **Status: early scaffold.** Only the project foundation (this phase) is
> built and verified. Authentication, onboarding, the dashboard, and
> deployment are not implemented yet - see [Known limitations](#known-limitations).

## Product

See [CLAUDE.md](CLAUDE.md) for the full product and engineering rules this
project follows.

## Architecture

```
Next.js (TypeScript, Tailwind) --HTTPS/REST--> FastAPI --> PostgreSQL
                                                   |
                                                   |-- CoinGecko client (prices)
                                                   |-- CryptoPanic client (news)
                                                   `-- OpenRouter client (AI insight)
```

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic, httpx
- **Database:** PostgreSQL
- **Auth:** JWT access tokens, bcrypt password hashing

## Repository layout

```
frontend/   Next.js app
backend/    FastAPI app
Skills/     Project-specific Claude Code skills used during development
```

## Local setup

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Requires a local PostgreSQL instance matching `DATABASE_URL` in `.env` once
the database schema is added (next phase). Until then the app boots without
a live database connection.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list
with descriptions. Never commit real `.env` / `.env.local` files.

## Database migrations

Not yet added. Alembic will be introduced in the database-schema phase.

## Tests

Backend:

```bash
cd backend
./venv/Scripts/pytest   # Windows
# pytest                # macOS/Linux
```

Currently covers only the `/health` endpoint. More tests are added
alongside each feature.

Frontend: not yet configured (Vitest + React Testing Library planned).

## Production build

```bash
cd frontend
npm run build
```

Verified passing as of the current scaffold.

## Deployment

Not yet deployed. Planned: Vercel (frontend), Render or Railway (backend +
managed PostgreSQL). Public URLs will be added here once live.

## Reviewer access to stored data

Not yet applicable - no database schema exists yet. A safe, read-only
reviewer access method (without exposing production credentials) will be
documented here once the database and dashboard are built.

## Known limitations

This is an early-stage scaffold. Not yet implemented: authentication,
onboarding, preferences, market-data integrations, AI insight generation,
the dashboard UI, feedback voting, automated tests beyond the health check,
and deployment.

## Financial disclaimer

This application is for informational purposes only and does not provide
financial advice.
