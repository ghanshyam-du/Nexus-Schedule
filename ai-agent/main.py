from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Import agent modules
from agents.scheduler_agent import SchedulerAgent
from agents.user_agent import UserAgent
from agents.provider_agent import ProviderAgent
from agents.priority_agent import PriorityAgent
from services.intent_processor import IntentProcessor
from services.voice_processor import VoiceProcessor

load_dotenv()

app = FastAPI(title="NexusSchedule AI Agent Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
scheduler_agent = SchedulerAgent()
user_agent = UserAgent()
provider_agent = ProviderAgent()
priority_agent = PriorityAgent()
intent_processor = IntentProcessor()
voice_processor = VoiceProcessor()

@app.get("/")
async def root():
    return {"message": "NexusSchedule AI Agent Service", "status": "running"}

@app.post("/process-intent")
async def process_intent(request: dict):
    """Process voice input and extract intent"""
    try:
        text = request.get("text", "")
        result = await intent_processor.process(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/schedule-appointment")
async def schedule_appointment(request: dict):
    """Handle appointment scheduling with AI agents"""
    try:
        # Agent-to-Agent communication simulation
        result = await scheduler_agent.process_booking_request(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/agent-communication")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time agent communication"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process agent communication
            response = await handle_agent_message(data)
            await websocket.send_text(response)
    except Exception as e:
        print(f"WebSocket error: {e}")

async def handle_agent_message(message: str):
    """Handle incoming agent messages"""
    # Implement agent message routing logic
    return "Agent response"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
