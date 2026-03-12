import asyncio
import json
from google.adk.agents import Agent, SequentialAgent
from google.adk.runners import InMemoryRunner
from dotenv import load_dotenv

load_dotenv()

from backend.agents import tools
from backend.agents import prompts

# Model to use across all agents.
# gemini-2.0-flash has a higher free-tier rate limit (15 RPM) compared to
# gemini-2.5-flash (5 RPM), making it far more practical for multi-agent
# pipelines that issue many LLM calls in quick succession.
AGENT_MODEL = "gemini-2.0-flash"

# Maximum number of retries when a 429 rate-limit error is hit.
MAX_RETRIES = 3

def create_agent_pipeline():
    """
    Creates and returns the 3-agent DAG for Biz-Mapper.
    Uses Google ADK's SequentialAgent to compose the squad.
    """
    
    # 1. The Strategist
    strategist = Agent(
        name="Strategist",
<<<<<<< Updated upstream
        model="gemini-1.5-flash",
=======
        model=AGENT_MODEL,
>>>>>>> Stashed changes
        description="Lead planner who interprets user goals and determines location and weights.",
        instruction=prompts.STRATEGIST_PROMPT,
        tools=[tools.geocode_neighborhood, tools.emit_thought_log]
    )
    
    # 2. The Geo-Analyst
    geo_analyst = Agent(
        name="Geo_Analyst",
<<<<<<< Updated upstream
        model="gemini-1.5-flash",
=======
        model=AGENT_MODEL,
>>>>>>> Stashed changes
        description="BigQuery specialist who executes map queries.",
        instruction=prompts.GEO_ANALYST_PROMPT,
        tools=[tools.get_schema, tools.run_query, tools.emit_thought_log]
    )
    
    # 3. The Cartographer
    cartographer = Agent(
        name="Cartographer",
<<<<<<< Updated upstream
        model="gemini-1.5-flash",
=======
        model=AGENT_MODEL,
>>>>>>> Stashed changes
        description="Data refiner who applies the mathematical scoring formula.",
        instruction=prompts.CARTOGRAPHER_PROMPT,
        tools=[tools.calculate_suitability, tools.emit_thought_log]
    )
    
    orchestrator = SequentialAgent(
        name="Orchestrator",
<<<<<<< Updated upstream
        model="gemini-1.5-flash",
=======
>>>>>>> Stashed changes
        description="Manages the pipeline from User Intent -> Execution -> Display",
        sub_agents=[strategist, geo_analyst, cartographer]
    )
    
    return orchestrator

async def run_planner(user_prompt: str) -> dict:
    """
    Executes the multi-agent pipeline given a user prompt.
    Returns the final result + all intermediate thoughts.
    Includes retry logic for Gemini API rate-limit (429) errors.
    """
    # Clear the global thought log queue for this request
    tools.thought_logs.clear()
    
    tools.emit_thought_log("System", "initializing", "Spinning up multi-agent DAG...")
    
    pipeline = create_agent_pipeline()
    runner = InMemoryRunner(agent=pipeline)
    
<<<<<<< Updated upstream
    final_output: str = ""
    try:
        events = await runner.run_debug(user_prompt, quiet=True)
        for event in events:
            # Safely parse the text out of the ADK Event
            event_dict = event.model_dump()
            if event_dict.get("content") and event_dict["content"].get("parts"):
                for part in event_dict["content"]["parts"]:
                    text_content = part.get("text")
                    if text_content:
                        final_output += str(text_content)
=======
    output_parts: list[str] = []
    last_error: Exception | None = None
>>>>>>> Stashed changes

    for attempt in range(1, MAX_RETRIES + 1):
        output_parts.clear()
        last_error = None
        try:
            events = await runner.run_debug(user_prompt, quiet=True)
            for event in events:
                # Safely parse the text out of the ADK Event
                event_dict = event.model_dump()
                if event_dict.get("content") and event_dict["content"].get("parts"):
                    for part in event_dict["content"]["parts"]:
                        if part.get("text"):
                            output_parts.append(str(part["text"]))
            # If we made it here, success — break out of the retry loop
            break

        except Exception as e:
            last_error = e
            error_str = str(e)
            # Check if this is a rate-limit / quota error worth retrying
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_seconds = 15 * attempt  # 15s, 30s, 45s
                tools.emit_thought_log(
                    "System", "rate_limited",
                    f"Hit API rate limit (attempt {attempt}/{MAX_RETRIES}). "
                    f"Waiting {wait_seconds}s before retrying..."
                )
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(wait_seconds)
                    continue
            # For non-retryable errors, break immediately
            break

    if last_error is not None:
        output_parts.append(f"Error during pipeline execution: {str(last_error)}")
        tools.emit_thought_log("System", "error", f"Pipeline failed: {str(last_error)}")
        
    # Attempt to parse final_output as JSON
    results = []
    try:
        # Sometimes LLMs wrap in markdown anyway despite instruction
        clean_json = str(final_output).strip()
        clean_json = clean_json.replace("```json", "").replace("```", "").strip()
        if clean_json:
            results = json.loads(clean_json)
    except Exception as e:
        print(f"Failed to parse JSON output: {e}. Raw output: {final_output}")

    return {
<<<<<<< Updated upstream
        "results": results,
        "final_output": final_output,
=======
        "final_output": "".join(output_parts),
>>>>>>> Stashed changes
        "thoughts": tools.thought_logs.copy()
    }
