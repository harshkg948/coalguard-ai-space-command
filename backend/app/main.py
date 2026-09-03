from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import simulation, sync, telemetry

app = FastAPI(
    title="CoalGuard AI Space Command",
    version="3.0.0"
)

# Crucial CORS configuration to allow Vite frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins including http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

app.include_router(simulation.router, prefix="/api/v1/simulation", tags=["Simulation"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["Sync"])
app.include_router(telemetry.router, prefix="/api/v1/telemetry", tags=["Telemetry"])

@app.get("/")
def read_root():
    return {"system": "CoalGuard AI Space Command API", "status": "ONLINE"}