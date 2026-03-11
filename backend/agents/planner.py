import json
from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner

from backend.agents import tools
from backend.agents import prompts

def create_agent_pipeline():
    """
    Creates and returns the 3-agent DAG for Biz-Mapper.
    Uses Google ADK's Agent class to compose the squad.
    """
    
    # 1. The Strategist
    strategist = Agent(
        name="Strategist",
        model="gemini-1.5-flash",
        description="Lead planner who interprets user goals and determines location and weights.",
        instruction=prompts.STRATEGIST_PROMPT,
        tools=[tools.geocode_neighborhood, tools.emit_thought_log]
    )
    
    # 2. The Geo-Analyst
    geo_analyst = Agent(
        name="Geo_Analyst",
        model="gemini-1.5-flash",
        description="BigQuery specialist who executes map queries.",
        instruction=prompts.GEO_ANALYST_PROMPT,
        tools=[tools.get_schema, tools.run_query, tools.emit_thought_log]
    )
    
    # 3. The Cartographer
    cartographer = Agent(
        name="Cartographer",
        model="gemini-1.5-flash",
        description="Data refiner who applies the mathematical scoring formula.",
        instruction=prompts.CARTOGRAPHER_PROMPT,
        tools=[tools.calculate_suitability, tools.emit_thought_log]
    )
    
    # Normally we would use SequentialAgent here, but in case it's not exported by the 
    # exact ADK version, we can create a parent Agent that delegates to sub-agents.
    orchestrator = Agent(
        name="Orchestrator",
        model="gemini-1.5-flash",
        description="Manages the pipeline from User Intent -> Execution -> Display",
        instruction=(
            "You are the central Orchestrator. The user will give you a business goal. "
            "You MUST follow this exact sequence:\n"
            "1. Delegate to the 'Strategist' to get a geocoded Research Plan and scoring weights.\n"
            "2. Delegate that plan to the 'Geo_Analyst' to fetch raw BigQuery POI and Census data.\n"
            "3. Delegate the raw data and weights to the 'Cartographer' to calculate final scores.\n"
            "Return the final Cartographer output exactly as it gives it to you."
        ),
        sub_agents=[strategist, geo_analyst, cartographer]
    )
    
    return orchestrator

async def run_planner(user_prompt: str) -> dict:
    """
    Executes the multi-agent pipeline given a user prompt.
    Returns the final result + all intermediate thoughts.
    """
    # Clear the global thought log queue for this request
    tools.thought_logs.clear()
    
    tools.emit_thought_log("System", "initializing", "Spinning up multi-agent DAG...")
    
    pipeline = create_agent_pipeline()
    runner = InMemoryRunner(agent=pipeline)
    
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

    except Exception as e:
        final_output = f"Error during pipeline execution: {str(e)}"
        tools.emit_thought_log("System", "error", f"Pipeline failed: {str(e)}")
        
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
        "results": results,
        "final_output": final_output,
        "thoughts": tools.thought_logs.copy()
    }
