# RELAY — Copilot instructions

RELAY is a small dashboard that shows a 4-agent task pipeline (Intake →
Extraction → Validation → Approval) plus a rule-based chatbot. It's an
engineering assignment for AlassaTech; the UI/UX is what's graded — keep the
backend minimal.

## Stack

- **Backend**: `backend/` — FastAPI, SQLAlchemy, PostgreSQL, Poetry. Runs on
  `:8000`.
- **Frontend**: `frontend/` — React 18 (Vite, not Next.js), Tailwind CSS,
  `lucide-react` icons. Runs on `:3000`.
- No auth, no Alembic/migrations, no ORM abstractions beyond one model. Don't
  add complexity the assignment doesn't ask for.

## Conventions

- Frontend: functional components + hooks only. No class components, no
  CSS-in-JS, no inline `style=` unless animating a computed value — style
  with Tailwind utility classes.
- All colors/fonts must come from the design tokens in
  `frontend/tailwind.config.js` (see `colors.ink`, `colors.surface`,
  `colors.surface2`, `colors.line`, `colors["text-primary"]`,
  `colors["text-secondary"]`, `colors.signal.{amber,teal,red,idle}`, and
  `fontFamily.{display,body,mono}`). Don't introduce new ad-hoc hex values —
  extend the token list instead.
- Backend: one router per resource (`app/routers/agents.py`,
  `app/routers/chat.py`), Pydantic schemas in `app/schemas.py`, hardcoded
  pipeline data in `app/agents_data.py`. Keep `app/main.py` thin.
- Env vars only, never hardcode secrets. Backend reads `DATABASE_URL` and
  `CORS_ORIGINS` via `app/config.py` (pydantic-settings). Frontend reads
  `VITE_API_URL` via `import.meta.env`.
- Never use `localStorage`/`sessionStorage` fallback assumptions — this is a
  normal browser app (not a Claude artifact), so browser storage is fine
  here if a feature ever needs it, but nothing currently relies on it.

## API contract (keep frontend/backend in sync with this)

- `GET /agents` → `Agent[]`: `{ id, name, role, description, status, permissions[] }`.
  `status` is one of `"idle" | "active" | "done"`.
- `POST /chat` body `{ message, session_id? }` → `ChatResponse`:
  `{ session_id, summary, table?, created_at }`. `table` is
  `{ columns: string[], rows: string[][] }` or omitted.
- `GET /chat/{session_id}/history` → persisted messages for that session
  (optional/debug use).

Full details: see `PROJECT_CONTEXT.md` at the repo root.

## Commands

- Backend: `cd backend && poetry install && poetry run uvicorn app.main:app --reload --port 8000`
- Frontend: `cd frontend && npm install && npm run dev`
- DB: Postgres db name `relay`, user `postgres`, password `12345678` (local dev only, see `backend/.env`).
