import json
from datetime import datetime
from backend.services import bigquery_client, maps_service

# Global list to store agent thoughts. 
# In a robust production app, use an asyncio.Queue or Redis pub/sub.
thought_logs = []

def get_schema(dataset_id: str, table_id: str) -> str:
    """
    Retrieves the schema for a specific BigQuery table to help formulate valid SQL queries.
    
    Args:
        dataset_id (str): The ID of the BigQuery dataset (e.g., 'census_bureau_acs').
        table_id (str): The ID of the table (e.g., 'blockgroup_2020_5yr').
        
    Returns:
        str: A JSON string representation of the table schema, containing column names and types.
    """
    schema = bigquery_client.get_table_schema(dataset_id, table_id)
    if not schema:
        return json.dumps({"error": f"Could not find schema for {dataset_id}.{table_id}"})
    return json.dumps({"schema": schema})

import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def run_query(sql: str) -> str:
    """
    Executes a SQL query against BigQuery and returns the results.
    
    Args:
        sql (str): The complete, valid BigQuery Standard SQL string to execute.
        
    Returns:
        str: A JSON string representation of the query results, limited to avoid token overflow.
    """
    results = bigquery_client.execute_query(sql)
    # Truncate results to prevent blowing up the LLM context window
    if len(results) > 20:
        summary = results[:20]
        return json.dumps({"results": summary, "note": f"Truncated; actual result count: {len(results)}"}, cls=DecimalEncoder)
    return json.dumps({"results": results}, cls=DecimalEncoder)

def calculate_suitability(candidates: list[dict], w1: float, w2: float, w3: float) -> str:
    """
    Calculates the Suitability Score (S) for a list of candidate locations.
    Formula: S = (w1 * Traffic) + (w2 * Density) - (w3 * Competition)
    
    Args:
        candidates (list[dict]): A list of location dictionaries, each MUST contain 'traffic', 'density', and 'competition' numeric keys, plus 'lat' and 'lng'.
        w1 (float): The weight assigned to foot traffic proximity.
        w2 (float): The weight assigned to target demographic density.
        w3 (float): The weight assigned to competition density (subtractive).
        
    Returns:
        str: A JSON string of the candidates ranked by descending suitability score.
    """
    for index, loc in enumerate(candidates):
        # Default to 0 if a feature is missing
        t = loc.get('traffic', 0)
        d = loc.get('density', 0)
        c = loc.get('competition', 0)
        
        score = (w1 * t) + (w2 * d) - (w3 * c)
        loc['suitability_score'] = round(score, 3)
        loc['id'] = index + 1
        
    # Sort descending by score
    sorted_candidates = sorted(candidates, key=lambda x: x['suitability_score'], reverse=True)
    
    # Return top 5
    return json.dumps({"ranked_candidates": sorted_candidates[:5]})

def geocode_neighborhood(place_name: str) -> str:
    """
    Converts a natural language neighborhood or place name into geographic bounding box coordinates
    and a central latitude/longitude coordinate pair.
    
    Args:
        place_name (str): Natural language description of a place (e.g., 'Capitol Hill, Seattle').
        
    Returns:
        str: A JSON string containing 'location' (lat/lng) and 'bounds' (south, west, north, east).
    """
    result = maps_service.geocode_to_bounding_box(place_name)
    return json.dumps({"geocoding_result": result})

def emit_thought_log(agent_name: str, status: str, message: str) -> str:
    """
    Logs an intermediate 'thought' or action taken by the agent. This powers the 'Thinking' UI sidebar.
    Mandatory: Agents MUST call this tool periodically to explain what they are actively doing.
    
    Args:
        agent_name (str): The name of the agent emitting the log (e.g., 'Strategist', 'Geo-Analyst', 'Cartographer').
        status (str): A short keyword category (e.g., 'analyzing_intent', 'executing_sql', 'scoring').
        message (str): A human-readable description of the current thought or action.
        
    Returns:
        str: A confirmation string that the log was recorded.
    """
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "agent": agent_name,
        "status": status,
        "message": message
    }
    thought_logs.append(log_entry)
    return "Log emitted successfully."
