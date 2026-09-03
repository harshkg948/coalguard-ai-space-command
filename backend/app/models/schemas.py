from pydantic import BaseModel, Field

class SimulationPayload(BaseModel):
    pit_depth: float = Field(..., description="Pit depth in meters")
    worker_density: int = Field(..., description="Active headcount in zone")
    equipment_age: float = Field(..., description="Average heavy machinery age in years")
    pending_violations: int = Field(..., description="Unresolved compliance flags")

class SyncEventPayload(BaseModel):
    event_id: str = Field(..., description="Unique event identifier for conflict prevention")
    local_timestamp: str = Field(..., description="Local edge timestamp captured during communication dead-zone")
    zone_id: str
    hazard_type: str
    severity: str