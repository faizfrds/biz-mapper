# biz-mapper

## Abstract
The Autonomous Urban Planner is an agent-driven web application that automates complex urban site selection. Users provide natural language business goals, and an AI agent autonomously queries demographic and geographic data to provide ranked recommendations visualized on an interactive map.

## Objectives
Natural Language Site Selection: Translate vague goals into structured data queries.
Transparent Reasoning: Visualize the agent’s "Chain of Thought" as it filters neighborhoods.
Data-Driven Accuracy: Leverage massive datasets (Census, OSM) for high-fidelity scoring.
Interactive Visualization: Use Google Maps to provide a spatial context for the final output.

### Design Doc
https://docs.google.com/document/d/1FtdZDKqD4mu7ZJQY_9pV6YbGrh8QfJyOZHVo3aZIE6E/edit?usp=sharing

## Getting Started & Usage Instructions

### Sample Prompts
- "I want to open an artisanal coffee shop in Seattle focusing on areas with high foot traffic and high median income, but away from existing large cafe chains."
- "Find me a location for a vegan bakery in Portland, Oregon, with good access to public transport and a young population."
- "Where should I open a dog-friendly cafe in Austin, Texas? Prioritize areas with many parks and young professionals."

### Demo UI

![Demo UI](/public/sample-result.png)

### Prerequisites
- Python 3.9+
- Node.js & npm
- A Google Cloud Project with **BigQuery** and the **Google Maps JavaScript API** enabled.
- A **Gemini API Key** (for Google ADK/LLM features) and Google Cloud credentials (for BigQuery).

### 1. Environment Variables
Create a `.env` file in the root directory (or in the backend and frontend folders).
**Backend (FastAPI) requires:**
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google Cloud service account JSON file.

**Frontend (React/Vite) requires:**
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key.

### 2. Running the Backend
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Running the Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Using the Application
1. Open your browser and go to `http://localhost:5173`.
2. In the **Search Bar**, enter a natural language business goal. For example: *"I want to open an artisanal coffee shop in Seattle focusing on areas with high foot traffic and high median income, but away from existing large cafe chains."*
3. Watch the **Thinking Log** on the left as it streams the AI's internal reasoning and BigQuery execution.
4. When complete, the recommended locations will be shown as cards and plotted as markers on the **Map View**.

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