# biz-mapper

## Abstract
The Autonomous Urban Planner is an agent-driven web application that automates complex urban site selection. Users provide natural language business goals, and an AI agent autonomously queries demographic and geographic data to provide ranked recommendations visualized on an interactive map.

## Objectives
Natural Language Site Selection: Translate vague goals into structured data queries.
Transparent Reasoning: Visualize the agent’s "Chain of Thought" as it filters neighborhoods.
Data-Driven Accuracy: Leverage massive datasets (Census, OSM) for high-fidelity scoring.
Interactive Visualization: Use Google Maps to provide a spatial context for the final output.

## Technical Stack
Layer
Technology
Role
Frontend
React + Tailwind CSS
Interactive UI and "Thinking" console.
Maps API
Google Maps (JS SDK)
Heatmaps, markers, and neighborhood boundaries.
Orchestration
Google ADK
Manages the agent’s logic, loops, and tool-calling.
LLM
Gemini 3.5
The "brain" for reasoning and SQL generation.
Data Warehouse
Google BigQuery
Stores US Census, OSM, and foot traffic proxies.
Backend API
FastAPI (Python)
Bridges the UI and the Agentic framework.


## Proposed Design & System Architecture
A. The Agentic Workflow (The Brain)
Instead of a simple linear script, the agent operates in a Reason-Act-Observe loop:
Parser: LLM extracts "Seattle," "Sourdough Bakery," and "High Foot Traffic" from the prompt.
SQL Tool: The agent generates a BigQuery SQL statement to find high-density residential areas with few "bakery" or "cafe" tags.
Refinement: If results are too broad, the agent "decides" to query a second dataset (e.g., median income levels).
Final Scoring: The agent applies a weighted formula to rank the top 3 coordinates.
B. Data Integration
The backend will primarily interface with BigQuery public datasets:
bigquery-public-data.census_bureau_acs: For population density and income levels. (US)
bigquery-public-data.geo_openstreetmap.planet_nodes: To identify existing competitors and points of interest (POIs).
C. UI "Thinking Process" Component
To make the AI feel "autonomous," the UI will feature a Log Stream. As the agent performs tasks, it emits status updates:
“Searching for commercial zones in Capitol Hill...”
“Found 12 existing bakeries; cross-referencing with foot traffic data...”
“Filtering for areas with >$80k median income...”

## Logic & Mathematics
The agent will calculate a Suitability Score ($S$) for each candidate location ($i$) using a weighted linear combination:
$$S_i = w_1 T_i + w_2 D_i - w_3 C_i$$
Where:
$T_i$ = Foot traffic proxy (e.g., proximity to transit hubs).
$D_i$ = Target demographic density.
$C_i$ = Competition density (nearby bakeries).
$w$ = Weights assigned by the LLM based on the user's specific goal.

## Milestones
Phase 1 (MVP): Connect Google ADK to BigQuery; successfully return 3 raw coordinates for a specific query in the console.
Phase 2 (Map Integration): Render BigQuery results as markers on Google Maps.
Phase 3 (Agentic Feedback): Implement the "Thinking" sidebar to show real-time agent logs.
Phase 4 (Refinement): Add "What-If" sliders (e.g., "Weight competition more heavily").

## Risks & Trade-offs
Query Latency: BigQuery is powerful but can be slow for real-time UI. Solution: Cache common neighborhood scores or use BigQuery BI Engine.
Hallucination: The LLM might invent a neighborhood. Solution: Use a "Grounding" layer where the LLM must select from a pre-defined list of Seattle neighborhood polygons.




biz-mapper/
├── backend/                # FastAPI / Python logic
│   ├── agents/             # Google ADK Implementation
│   │   ├── planner.py      │   # The main Reason-Act-Observe loop
│   │   ├── tools.py        │   # BigQuery & Maps tool definitions
│   │   └── prompts.py      │   # System instructions & Few-shot examples
│   ├── services/           # External Integrations
│   │   ├── bigquery_client.py  # SQL execution & BQML calls
│   │   └── maps_service.py     # Geometry & Routing logic
│   ├── main.py             # FastAPI entry point & routes
│   └── requirements.txt
├── frontend/               # React + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapContainer.jsx   # Google Maps SDK integration
│   │   │   ├── ThinkingLog.jsx    # The Agent's "Log Stream" UI
│   │   │   └── SearchBar.jsx      # Natural Language Input
│   │   ├── hooks/                 # Custom React hooks for API calls
│   │   └── App.js
│   ├── public/
│   └── package.json
├── data/                   # Data Engineering (Optional/Local)
│   ├── queries/            # Saved SQL scripts for BigQuery
│   └── schemas/            # JSON definitions of Census/OSM tables
├── .env                    # API Keys (Google Cloud, Gemini)
└── README.md               # Your Design Doc