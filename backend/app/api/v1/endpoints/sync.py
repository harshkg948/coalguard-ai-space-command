from fastapi import APIRouter, Request
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import os

router = APIRouter()

# Load real India coal mine safety dataset on startup
DATA_PATH = "india_coal_mine_safety_data_source_grounded.csv"
if os.path.exists(DATA_PATH):
    df_mines = pd.read_csv(DATA_PATH)
else:
    df_mines = pd.DataFrame()

# Global Shared Command State across all modules
GLOBAL_COMMAND_STATE = {
    "active_event": "IND-MINE-0001",
    "zone_id": "JHARKHAND-NORTH-01",
    "state": "Jharkhand",
    "mine_type": "Opencast",
    "pit_depth": 245.0,
    "worker_density": 180,
    "equipment_age": 15.5,
    "pending_violations": 4,
    "hazard_type": "Rock Deformation & Slope Shear",
    "risk_score": 7.4,
    "risk_level": "CRITICAL",
    "dgms_code": "SEC-44-B-SLOPE-INSTABILITY",
    "deformation_velocity": 1.2,
    "affected_area": 450,
    "triggered_nodes": ["R17", "R18", "R19", "R25"],
    "graph_features": {
        "degree": 5,
        "mean_neighbor_compliance": 82.5,
        "mean_neighbor_violations": 3.2
    },
    "xai_breakdown": {
        "feature_names": ["Compliance Rate Gap", "Pending Audit Violations", "Environmental Breach Rate", "Graph Neighbor Risk"],
        "shap_values": [0.42, 0.30, 0.18, 0.10],
        "impacts": [42, 30, 18, 10]
    },
    "compliance_status": "CRITICAL_NON_COMPLIANT"
}

SYNC_DATABASE: List[Dict[str, Any]] = []

@router.post("/offline-queue")
async def process_offline_sync(request: Request) -> Dict[str, Any]:
    try:
        body = await request.json()
        event_id = body.get("event_id", f"INSP-EVT-{len(SYNC_DATABASE)+100}")
        
        pit_depth = float(body.get("pit_depth", 245.0))
        worker_density = int(body.get("worker_density", 180))
        equipment_age = float(body.get("equipment_age", 15.5))
        pending_violations = int(body.get("pending_violations", 4))
        hazard_type = body.get("hazard_type", "Rock Deformation & Slope Shear")
        zone_id = body.get("zone_id", "JHARKHAND-NORTH-01")

        # Mathematical Risk Calculation aligned with notebook formula
        risk_score = min(9.9, round((pit_depth / 45.0) + (pending_violations * 0.4) + (equipment_age * 0.1), 1))
        risk_level = "CRITICAL" if risk_score > 7.0 else ("MODERATE" if risk_score > 4.0 else "STABLE")
        
        depth_weight = round(pit_depth / 400.0, 2)
        violation_weight = round(pending_violations / 20.0, 2)
        equipment_weight = round(equipment_age / 30.0, 2)
        worker_weight = round(worker_density / 500.0, 2)

        xai_data = {
            "feature_names": ["Pit Depth & Geometry", "Pending Audit Violations", "Heavy Equipment Age", "Worker Density Load"],
            "shap_values": [depth_weight, violation_weight, equipment_weight, worker_weight],
            "impacts": [int(depth_weight*100), int(violation_weight*100), int(equipment_weight*100), int(worker_weight*100)]
        }

        GLOBAL_COMMAND_STATE.update({
            "active_event": event_id,
            "zone_id": zone_id,
            "pit_depth": pit_depth,
            "worker_density": worker_density,
            "equipment_age": equipment_age,
            "pending_violations": pending_violations,
            "hazard_type": hazard_type,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "dgms_code": "SEC-44-B-SLOPE-INSTABILITY" if risk_score > 7.0 else "SEC-00-NOMINAL",
            "deformation_velocity": round(risk_score * 0.18, 2),
            "affected_area": int(worker_density * 2.5),
            "triggered_nodes": ["R17", "R18", "R19", "R25"] if risk_score > 7.0 else ["R01", "R02"],
            "xai_breakdown": xai_data,
            "compliance_status": "CRITICAL_NON_COMPLIANT" if risk_score > 7.0 else "COMPLIANT"
        })

        SYNC_DATABASE.append(GLOBAL_COMMAND_STATE.copy())

        return {
            "status": "SUCCESS",
            "event_id": event_id,
            "global_state": GLOBAL_COMMAND_STATE
        }
    except Exception as e:
        return {"status": "ERROR", "detail": str(e)}

@router.get("/command-state")
def get_command_state() -> Dict[str, Any]:
    return GLOBAL_COMMAND_STATE

@router.get("/mines/sample")
def get_sample_mines() -> List[Dict[str, Any]]:
    if not df_mines.empty:
        # Return first 20 real mines from the CSV for selector dropdowns
        return df_mines[["mine_id", "state", "mine_type", "compliance_rate"]].head(20).to_dict(orient="records")
    return []

@router.get("/offline-queue/logs")
def get_synced_logs() -> List[Dict[str, Any]]:
    return SYNC_DATABASE