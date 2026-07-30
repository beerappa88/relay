# RELAY — Full Project Context

This document is a complete reference for the RELAY codebase: what it is, why
things are built the way they are, the exact API/data contracts, and the
design system. Paste it into a Copilot chat, pin it as context, or keep it
open for reference while extending the project. A shorter, always-on version
of this lives at `.github/copilot-instructions.md` (VS Code loads that one
automatically into every Copilot Chat request in this workspace).

---

## 1. What this is

An engineering assignment from AlassaTech ("RELAY" agentic platform brief):
build a small web app with (a) a page showing a 4-step AI agent pipeline and
(b) a chatbot that can answer simple questions about that pipeline. Grading
weights UI/UX heavily (35%) and pipeline clarity (20%); backend is
deliberately minimal (10%, "we are not grading backend complexity").

**The 4 agents, in fixed order:**

| # | Agent | What it does |
|---|-------|---------------|
| 01 | Intake Agent | Receives the incoming request, marks it "new". |
| 02 | Extraction Agent | Pulls out key details (invoice #, amount, customer). |
| 03 | Validation Agent | Checks the extracted details are correct/consistent. |
| 04 | Approval Agent | Approves automatically, or flags for human review. |

---

## 2. Decisions made and why

These were explicitly chosen with the user, not assumed:

- **Chatbot = rule-based**, not the Groq LLM option. Reasoning given: no API
  key dependency, nothing external to break, fastest to implement correctly,
  and the assignment's own weighting says the frontend is what matters most.
- **Chat history persisted in Postgres**, not in-memory. Reasoning: the user
  explicitly asked for a local Postgres setup with a specific db
  name/password; if nothing used it, that setup would be pointless. Chat
  history is the one place in this app where persistence makes sense (the
  `/agents` list is static/hardcoded).
- **DB name = project name = `relay`**, user `postgres`, password
  `12345678`. Local dev only — never commit real credentials (`.env` is
  gitignored; `.env.example` documents the shape).
- **React via Vite**, not Next.js/CRA — assignment said either React or
  Next.js was fine; Vite was chosen as the lighter/faster React setup since
  there's no server-side rendering need here.
- **Poetry** for backend dependency management (per user request), no
  Alembic/migrations tool — tables are created on startup via
  `Base.metadata.create_all()`, which is enough for this scope.
- **No auth** — out of scope for the assignment.

---

## 3. Architecture

```
relay/
├── .github/
│   └── copilot-instructions.md   # short, auto-loaded Copilot context
├── PROJECT_CONTEXT.md            # this file
├── README.md                     # setup/run instructions
├── backend/                      # FastAPI + Poetry + Postgres, port 8000
│   ├── pyproject.toml
│   ├── .env / .env.example       # DATABASE_URL, CORS_ORIGINS, APP_ENV
│   └── app/
│       ├── main.py               # FastAPI app, CORS, startup table creation
│       ├── config.py             # pydantic-settings, reads .env
│       ├── database.py           # SQLAlchemy engine/session/Base
│       ├── models.py             # ChatMessage ORM model
│       ├── schemas.py            # Pydantic request/response models
│       ├── agents_data.py        # hardcoded 4-agent pipeline data
│       ├── chatbot.py            # rule-based reply logic
│       └── routers/
│           ├── agents.py         # GET /agents
│           └── chat.py           # POST /chat, GET /chat/{id}/history
└── frontend/                     # React + Vite + Tailwind, port 3000
    ├── package.json
    ├── vite.config.js            # dev server pinned to port 3000
    ├── tailwind.config.js        # design tokens (source of truth for styling)
    ├── .env / .env.example       # VITE_API_URL
    └── src/
        ├── main.jsx
        ├── App.jsx               # Header + PipelineBoard + ChatWidget
        ├── api.js                # fetchAgents(), postChat()
        ├── index.css             # Tailwind layers, focus-visible, keyframif you need them
        └── components/
            ├── Header.jsx
            ├── PipelineBoard.jsx # fetch, "Run a task" animation orchestration
            ├── AgentNode.jsx     # single agent card (icon, status, permissions)
            ├── Connector.jsx     # line between two nodes + traveling pulse
            ├── StatusBadge.jsx   # idle/active/done pill with dot
            ├── ActivityLog.jsx   # timestamped log under the pipeline
            ├── ChatWidget.jsx    # floating button + chat panel
            └── ChatTable.jsx     # renders {columns, rows} inside a chat bubble
```

Frontend and backend are fully separate processes/ports; they only talk over
HTTP through `VITE_API_URL` → CORS-allowed origin.

---

## 4. API contract

### `GET /agents`

Returns the 4 hardcoded agents (source: `backend/app/agents_data.py`).

```jsonc
[
  {
    "id": 1,
    "name": "Intake Agent",
    "role": "Receiver",
    "description": "Receives the incoming request and marks it as new.",
    "status": "done",        // "idle" | "active" | "done"
    "permissions": ["read:requests", "write:ticket"]
  },
  // ...ids 2-4: Extraction Agent, Validation Agent, Approval Agent
]
```

Note: the `status` returned here is a static snapshot (used for the initial
render). The "Run a task" button in `PipelineBoard.jsx` then drives status
transitions **client-side** for the animation — it does not re-fetch from the
backend mid-run. If you later want the backend to own live state, you'd add
a `POST /agents/{id}/status` (or a WebSocket) and remove the client-side
simulation in `PipelineBoard.jsx`.

### `POST /chat`

Request:

```jsonc
{ "message": "list the agents", "session_id": "optional-uuid" }
```

Response:

```jsonc
{
  "session_id": "generated-or-echoed-uuid",
  "summary": "RELAY runs a task through 4 agents, in order:",
  "table": { "columns": ["#", "Agent", "Role", "Status"], "rows": [["01", "Intake Agent", "Receiver", "Done"], ...] }, // omitted (null) when not applicable
  "created_at": "2026-07-29T12:00:00Z"
}
```

Both the user message and the assistant's `summary` are persisted to the
`chat_messages` table (see `backend/app/models.py`), keyed by `session_id`.
`session_id` is generated client-side in `ChatWidget.jsx` via
`crypto.randomUUID()` and reused for every message in that browser tab.

### `GET /chat/{session_id}/history`

Optional/debug endpoint. Returns persisted `{role, content, created_at}[]`
for a session, ordered oldest-first. Not currently called by the frontend
(the widget keeps its own in-memory message list) — useful if you add
"resume conversation after refresh" later.

### Rule-based chatbot logic (`backend/app/chatbot.py`)

Pattern-matches the lowercased message against, in order: greeting →
thanks → "permission" → "status" → a specific agent name (intake /
extraction / validation / approval) → "list/show agents" → "pipeline / how
does it work / flow" → fallback help message. Add new rules as additional
`if`/`elif`-style branches in `get_reply()`; each branch returns
`(summary_text, table_or_None)`.

---

## 5. Design system (source of truth: `frontend/tailwind.config.js`)

**Concept**: a control-room / signal-relay console — a task is literally a
signal being relayed through 4 stations.

**Colors**

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0B0F14` | page background |
| `surface` | `#131A22` | cards, panels |
| `surface2` | `#1A2330` | hover/raised state, chat header |
| `line` | `#232D38` | borders, idle connectors |
| `text-primary` | `#E7ECF2` | headings, primary text |
| `text-secondary` | `#8B98A8` | secondary/meta text |
| `signal-amber` | `#F2A93B` | active state, primary CTA, brand accent |
| `signal-teal` | `#4FD1AE` | done state |
| `signal-red` | `#FF6B5B` | errors/flagged |
| `signal-idle` | `#3B4552` | idle status dot |

**Type**

- Display (`font-display`): Space Grotesk — headings, agent names, numbers.
- Body (`font-body`): Inter — descriptions, chat text, default body font.
- Mono (`font-mono`): JetBrains Mono — status labels, timestamps, ids,
  permission tags, log lines, table cells.

**Signature interaction**: the "Run a task" button in `PipelineBoard.jsx`
walks a simulated request through all 4 nodes — each node goes
`idle → active → done` with a glowing amber ring while active, and the
connector between two nodes plays a traveling dot (`Connector.jsx`, driven by
the `animate-flowX`/`animate-flowY` keyframes in `tailwind.config.js`) while
the "signal" is in transit. Timing constants (`PROCESS_MS = 900`,
`FLOW_MS = 700`) live at the top of `PipelineBoard.jsx`. `ActivityLog.jsx`
prints a timestamped line for each step, sourced from `LOG_LINES` in the same
file — keep that array's ordering (`[step0-start, step0-to-1, step1-start,
step1-to-2, ...]`) in sync if you change the number/order of agents.

`prefers-reduced-motion: reduce` disables the pulse/ping animations (see
`frontend/src/index.css`).

---

## 6. Environment variables

**`backend/.env`**
```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/relay
CORS_ORIGINS=http://localhost:3000
APP_ENV=development
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:8000
```

If you change ports, update both `CORS_ORIGINS` (backend) and
`VITE_API_URL` (frontend) — `vite.config.js` also pins the dev server to
`3000` explicitly.

---

## 7. Run commands

```bash
# DB (one-time)
createdb -U postgres relay

# Backend
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## 8. Known gaps / not done yet

- Built and syntax-checked (Python compiled cleanly with `py_compile`) but
  **not run end-to-end** — the environment that generated this code had no
  network access, so `npm install` / `poetry install` / actually booting
  both servers still needs to happen on your machine. Smoke-test before
  recording the demo.
- No automated tests.
- No `/agents/{id}/status` write endpoint — pipeline animation is
  client-side only (see note in section 4).
- Screen recording deliverable not produced (needs to be captured locally).
