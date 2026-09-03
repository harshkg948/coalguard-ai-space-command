# backend/app/services/global_state.py

GLOBAL_COMMAND_STATE = {
    "active_event": None,
    "pit_depth": 200.0,
    "worker_density": 150,
    "equipment_age": 8.0,
    "pending_violations": 3,
    "hazard_type": "Rock Deformation & Slope Shear",
    "risk_score": 0.42,
    "risk_level": "MODERATE",
    "xai_breakdown": {
        "base_value": 0.4,
        "shap_values": [0.15, -0.02, 0.10, 0.15],
        "feature_names": ["pit_depth", "worker_density", "equipment_age", "pending_violations"]
    },
    "compliance_status": "MONITORING"
}