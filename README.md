# RELAY — Agent Pipeline Console

A sleek web app that visualizes a 4-agent task pipeline with a conversational chatbot interface. Watch tasks flow through **Intake → Extraction → Validation → Approval** with smooth animations and real-time status updates.

## What It Does

**RELAY** is a visual pipeline console for an AI agentic platform. It demonstrates:

- **4-Agent Pipeline UI**: Displays Intake → Extraction → Validation → Approval agents in a clear left-to-right layout
- **Signature Animation**: A smooth amber pulse travels across the pipeline showing task progression through each agent
- **Live Status Tracking**: Each agent shows idle/active/done state with visual indicators and real-time updates
- **Activity Log**: Timestamped record of what happens at each step
- **Rule-Based Chatbot**: Ask about agents and permissions; get formatted table responses
- **Responsive Design**: Works seamlessly on desktop and mobile (390px to 1280px+)

## How to Run Locally

### Prerequisites

- **Node.js** 18+ (frontend)
- **Python** 3.9+ with [Poetry](https://python-poetry.org/) (backend)
- **PostgreSQL** running locally (database, optional for chat history)

### Backend Setup

```bash
cd backend

# Install dependencies
poetry install

# Create .env file (or use existing .env.example)
# DATABASE_URL=postgresql://postgres:12345678@localhost/relay
# CORS_ORIGINS=http://localhost:3000

# Run the server
poetry run uvicorn app.main:app --reload --port 8000
```

Backend starts on **http://localhost:8000**

Check health: `curl http://localhost:8000/agents`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts on **http://localhost:3000**

### Optional: Database Setup

If you want to persist chat history:

```bash
# Create the relay database
createdb -U postgres relay

# When prompted for password, use: 12345678
```

## Features

✅ **Keyboard Shortcuts**
- `Ctrl+K` (or `Cmd+K`) — Open/close chat
- `Escape` — Close chat

✅ **Sample Chatbot Questions**
- "list the agents" → Shows agent table with status
- "what does the extraction agent do?" → Agent description
- "show permissions" → Permissions table for all agents

✅ **Pipeline Demo**
- Click "Run a task" to see all 4 agents animate through idle → active → done
- Watch the connector pulse travel across the pipeline
- See task completion celebration (✓ Success badge)

✅ **Mobile Responsive**
- Agents stack vertically on mobile
- Full 4-column layout on desktop
- Touch-friendly chat widget

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (with custom design tokens)
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Icons**: Lucide React
- **No auth, no over-engineering** — kept minimal per assignment scope

## API Endpoints

### `GET /agents`
Returns the 4 pipeline agents with permissions.

```bash
curl http://localhost:8000/agents
```

### `POST /chat`
Send a message to the chatbot.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "list the agents", "session_id": "optional-uuid"}'
```

## Project Structure

```
relay-alassatech/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── config.py          # Settings & environment
│   │   ├── database.py        # Database connection
│   │   ├── chatbot.py         # Rule-based chatbot logic
│   │   ├── agents_data.py     # Hardcoded 4 agents
│   │   └── routers/
│   │       ├── agents.py      # GET /agents endpoint
│   │       └── chat.py        # POST /chat endpoint
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── api.js             # API client
│   │   └── components/
│   │       ├── PipelineBoard.jsx    # Main orchestrator
│   │       ├── AgentNode.jsx        # Agent card
│   │       ├── ChatWidget.jsx       # Floating chat
│   │       ├── ActivityLog.jsx      # Event log
│   │       └── StatusBadge.jsx      # Status indicator
│   ├── tailwind.config.js     # Design tokens
│   ├── vite.config.js
│   └── package.json
│
└── README.md (this file)
```
