from fastapi import APIRouter
from pydantic import BaseModel
import networkx as nx

router = APIRouter()

class SimulationRequest(BaseModel):
    pit_depth: float = 200.0
    worker_density: int = 150
    equipment_age: float = 8.0
    pending_violations: int = 3

@router.post("/run")
async def run_simulation(data: SimulationRequest):
    try:
        risk_score = min(9.9, round((data.pit_depth / 50.0) + (data.pending_violations * 0.5), 1))
        classification = "CRITICAL" if risk_score > 7.0 else ("MODERATE" if risk_score > 4.0 else "STABLE")
        
        return {
            "simulated_risk_score": risk_score,
            "risk_classification": classification,
            "dgms_code": "SEC-44-B-SLOPE-INSTABILITY" if risk_score > 7.0 else "SEC-00-NOMINAL",
            "predicted_deformation_velocity_mm_h": round(risk_score * 0.15, 2),
            "affected_area_sq_m": int(data.worker_density * 2.5),
            "triggered_cluster_nodes": ["R17", "R18", "R19", "R25"],
            "shap_attributions": [
                {
                    "feature": "Pit Depth & Slope Geometry", 
                    "impact": 40, 
                    "color": "bg-red-500", 
                    "description": "High bench gradient increasing shear stress."
                },
                {
                    "feature": "Pending Audit Violations", 
                    "impact": 35, 
                    "color": "bg-orange-500", 
                    "description": "Unresolved compliance markers accumulating safety risk."
                },
                {
                    "feature": "Heavy Equipment Age", 
                    "impact": 25, 
                    "color": "bg-yellow-500", 
                    "description": "Vibration load near perimeter walls."
                }
            ]
        }
    except Exception as e:
        return {
            "error": str(e), 
            "simulated_risk_score": 5.0, 
            "risk_classification": "MODERATE",
            "dgms_code": "SEC-00-NOMINAL",
            "predicted_deformation_velocity_mm_h": 0.5,
            "affected_area_sq_m": 100,
            "triggered_cluster_nodes": ["R01"],
            "shap_attributions": []
        }