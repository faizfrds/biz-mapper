# Biz-Mapper — Implementation Plan

## Overview

Biz-Mapper is an **agent-driven urban site-selection web app**. A user types a natural-language business goal (e.g., *"Open a sourdough bakery in Seattle with high foot traffic"*), and an AI agent autonomously queries Census + OpenStreetMap data via BigQuery, scores candidate locations, and visualizes ranked recommendations on Google Maps—all while streaming its chain-of-thought reasoning to a live "Thinking" sidebar.

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Tailwind CSS | UI, search bar, thinking console, map |
| Maps | Google Maps JS SDK | Heatmaps, markers, boundaries |
| Orchestration | Google ADK | Agent loop, tool-calling |
| LLM | Gemini 2.5 | Reasoning, SQL generation |
| Data Warehouse | Google BigQuery | Census, OSM, foot-traffic data |
| Backend API | FastAPI (Python) | Bridge between UI and agent |

---

## Phase 1 — MVP: Agent ↔ BigQuery Console Pipeline

> **Goal:** Submit a natural-language query and get 3 ranked coordinates in the terminal.

### Backend

#### `backend/requirements.txt`
Define dependencies: `fastapi`, `uvicorn`, `google-cloud-bigquery`, `google-adk`, `google-generativeai`, `python-dotenv`.

#### `backend/services/bigquery_client.py`
- Initialize BigQuery client using service-account credentials from `.env`.
- Expose an `execute_query(sql: str) -> list[dict]` helper that runs arbitrary SQL and returns rows.

#### `backend/agents/prompts.py`
- `SYSTEM_PROMPT`: instructs Gemini to act as an urban planner; defines the persona, constraints, and output format (JSON with `lat`, `lng`, `score`, `reason`).
- `FEW_SHOT_EXAMPLES`: 2-3 example user↔agent exchanges showing correct SQL generation and scoring.

#### `backend/agents/tools.py`
- Define ADK tool wrappers:
  - `query_bigquery(sql)` → calls `bigquery_client.execute_query`.
  - `score_locations(candidates, weights)` → applies the suitability formula.
- Each tool includes a description so the LLM knows when to invoke it.

#### `backend/agents/planner.py`
- Create the ADK `Agent` with Gemini as the model, attach the tools from `tools.py`, and inject the system prompt from `prompts.py`.
- Implement a `run(user_prompt: str)` function that:
  1. Sends the user prompt to the agent.
  2. Enters the Reason → Act → Observe loop (handled by ADK).
  3. Collects and returns the final ranked results + the intermediate "thoughts" log.

#### `backend/main.py`
- `POST /api/query` — accepts `{ "prompt": "..." }`, calls `planner.run()`, returns `{ results, thoughts }`.
- `GET /api/health` — simple health-check.
- CORS middleware configured for the React dev server (`localhost:3000`).

### Data

#### `data/schemas/`
- `census_acs.json` — document the columns we use from `bigquery-public-data.census_bureau_acs`.
- `osm_nodes.json` — document the columns from `bigquery-public-data.geo_openstreetmap.planet_nodes`.

#### `data/queries/`
- `population_density.sql` — reference query for population density by geo.
- `competitor_count.sql` — reference query for counting POIs of a given type within a radius.

### Scoring Formula (reference)

$$S_i = w_1 T_i + w_2 D_i - w_3 C_i$$

| Symbol | Meaning | Source |
|--------|---------|--------|
| $T_i$ | Foot-traffic proxy (transit-hub proximity) | OSM `highway=bus_stop` / `railway=station` |
| $D_i$ | Target demographic density | Census ACS population tables |
| $C_i$ | Competition density | OSM POI tags matching business type |
| $w_{1,2,3}$ | Weights assigned by the LLM based on user goal | Agent reasoning |

---

## Phase 2 — Map Integration: React + Google Maps

> **Goal:** Render BigQuery results as interactive markers on a map.

### Frontend Setup

#### `frontend/package.json`
Initialize with `create-react-app` or Vite. Key dependencies:
`react`, `react-dom`, `@react-google-maps/api`, `tailwindcss`, `axios`.

#### `frontend/src/App.js`
- Top-level layout: **SearchBar** (top) + **MapContainer** (center) + **ThinkingLog** (sidebar/drawer).
- Manage shared state: `query`, `results`, `thoughts`, `isLoading`.

#### `frontend/src/components/SearchBar.jsx`
- Controlled input + submit button.
- On submit → `POST /api/query` via Axios, update parent state with response.

#### `frontend/src/components/MapContainer.jsx`
- Load Google Maps via `@react-google-maps/api` with API key from env.
- Default center on continental US.
- When `results` arrive → place numbered `Marker` components with info windows showing the score breakdown and reasoning.

#### `frontend/src/hooks/`
- `useQuery.js` — custom hook wrapping the `/api/query` call with loading/error state.

---

## Phase 3 — Agentic Feedback: Live "Thinking" Sidebar

> **Goal:** Stream the agent's chain-of-thought in real time.

### Backend Changes

#### `backend/main.py`
- Add a **WebSocket** endpoint `ws /api/ws/query` (or use Server-Sent Events via `StreamingResponse`).
- As the agent emits intermediate "thoughts" during its loop, push them to the client immediately rather than batching.

#### `backend/agents/planner.py`
- Add a callback/event-emitter that fires on each agent step (tool invocation, reasoning output).
- Forward events to the WebSocket/SSE handler.

### Frontend Changes

#### `frontend/src/components/ThinkingLog.jsx`
- Connect to the WebSocket / EventSource.
- Render each thought as a styled log entry with timestamp and category icon (🔍 search, 🧮 scoring, 📊 data).
- Auto-scroll to bottom on new entries.
- Collapsible/expandable panel.

#### `frontend/src/components/SearchBar.jsx`
- Update to initiate the WebSocket connection on submit instead of a plain REST call.

---

## Phase 4 — Refinement: "What-If" Sliders

> **Goal:** Let users interactively adjust scoring weights and instantly re-rank.

### Frontend

- Add a `WeightSliders.jsx` component with three range inputs for $w_1$, $w_2$, $w_3$.
- On slider change → `POST /api/rescore` with current candidates + new weights.
- Map markers re-order/re-color based on the new scores.

### Backend

#### `backend/main.py`
- `POST /api/rescore` — accepts `{ candidates, weights }`, applies the formula, returns re-ranked results (no LLM call needed, pure math).

---

## Environment & Configuration

### `.env` (git-ignored)
```
GOOGLE_CLOUD_PROJECT=<your_project_id>
GOOGLE_MAPS_API_KEY=<your_maps_key>
GEMINI_API_KEY=<your_gemini_key>
BIGQUERY_DATASET=<optional_custom_dataset>
```

---

## Project Structure (created)

```
biz-mapper/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── planner.py         # ADK agent loop
│   │   ├── tools.py           # BigQuery & scoring tools
│   │   └── prompts.py         # System prompt & few-shot
│   ├── services/
│   │   ├── __init__.py
│   │   ├── bigquery_client.py # SQL execution
│   │   └── maps_service.py    # Geometry helpers
│   ├── main.py                # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapContainer.jsx
│   │   │   ├── ThinkingLog.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── hooks/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── data/
│   ├── queries/               # Reference SQL scripts
│   └── schemas/               # BigQuery table schemas
├── .env
├── .gitignore
├── implementation_plan.md
└── README.md
```

---

## Verification Plan

Since Phase 1 has no UI and later phases build incrementally, verification will happen phase-by-phase:

### Phase 1 Verification
1. **Unit test BigQuery client** — mock the BigQuery client and verify `execute_query` returns expected rows.
   ```bash
   cd backend && python -m pytest tests/ -v
   ```
2. **Integration test the agent** — provide a known prompt, verify the response contains `lat`, `lng`, `score` fields.
3. **Manual smoke test** — run `uvicorn backend.main:app --reload`, `curl` the `/api/query` endpoint, inspect JSON.

### Phase 2 Verification
1. **Manual browser test** — start React dev server, type a query, confirm markers appear on the map at the returned coordinates.
2. **Check CORS** — verify the React app at `localhost:3000` can reach the FastAPI backend at `localhost:8000` without errors in the console.

### Phase 3 Verification
1. **WebSocket test** — open browser DevTools → Network → WS tab, confirm thought events stream in real time as the agent runs.
2. **UI test** — verify the ThinkingLog panel populates with timestamped entries and auto-scrolls.

### Phase 4 Verification
1. **Slider interaction** — adjust weights, confirm marker order changes without a full re-query to the LLM.
2. **Edge cases** — set all weights to 0, set one weight to max, verify no crashes.

> [!IMPORTANT]
> A backend `tests/` directory should be created during Phase 1 execution to house `pytest` tests. The exact test structure will be defined when writing the actual code.
