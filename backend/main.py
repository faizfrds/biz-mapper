import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.agents import planner, tools

app = FastAPI(title="Biz-Mapper API", version="1.0.0")

# Configure CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "message": "Biz-Mapper API is running."}

@app.post("/api/query")
async def run_query(request: QueryRequest):
    """
    Synchronous / REST endpoint to run the agent pipeline.
    Returns the final result and all thoughts at once.
    """
    result = await planner.run_planner(request.prompt)
    return result

@app.websocket("/api/ws/query")
async def websocket_query(websocket: WebSocket):
    """
    WebSocket endpoint for real-time streaming of the agent's Chain of Thought.
    """
    await websocket.accept()
    
    try:
        # Receive the initial prompt
        data = await websocket.receive_text()
        request_data = json.loads(data)
        prompt = request_data.get("prompt", "")
        
        if not prompt:
            await websocket.send_json({"error": "Empty prompt provided."})
            return
            
        # We need a way to stream thoughts while the pipeline runs.
        # Since run_planner might block or run async without giving us hooks easily,
        # we will set up a background task to poll our simple global list.
        # In production, use asyncio events or queues directly tied to the agent.
        
        # Clear the queue first
        tools.thought_logs.clear()
        
        # Task 1: Run the planner
        planner_task = asyncio.create_task(planner.run_planner(prompt))
        
        # Task 2: Poll and stream logs
        last_log_count = 0
        while not planner_task.done():
            current_logs = tools.thought_logs
            if len(current_logs) > last_log_count:
                # Send the new logs
                for log in current_logs[last_log_count:]:
                    await websocket.send_json(log)
                last_log_count = len(current_logs)
            await asyncio.sleep(0.5) # Poll every half second
            
        # Ensure we send any remaining logs
        current_logs = tools.thought_logs
        if len(current_logs) > last_log_count:
            for log in current_logs[last_log_count:]:
                await websocket.send_json(log)
        
        # Finally, get the result
        result = planner_task.result()
        await websocket.send_json({
            "agent": "System",
            "status": "complete",
            "final_result": result["final_output"]
        })
        
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
