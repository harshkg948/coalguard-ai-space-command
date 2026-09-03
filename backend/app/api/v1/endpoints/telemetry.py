from fastapi import APIRouter
import random
from typing import Dict, Any, List

router = APIRouter()

@router.get("/live-sensors")
def get_live_sensor_telemetry() -> List[Dict[str, Any]]:
    sensors = [
        {"sensor_id": "IOT-SEN-01", "location": "Open-Cast Bench Alpha", "type": "Seismic Geophone", "reading": f"{random.uniform(0.1, 1.8):.2f} mm/s", "status": "ACTIVE"},
        {"sensor_id": "IOT-SEN-02", "location": "Main Haulage Ramp North", "type": "InSAR Radar", "reading": f"{random.uniform(1.2, 3.4):.2f} mm/h", "status": "WARNING"},
        {"sensor_id": "IOT-SEN-03", "location": "Underground Shaft Level 3", "type": "Methane & CO Gas", "reading": f"{random.uniform(0.01, 0.4):.2f} %LEL", "status": "ACTIVE"},
        {"sensor_id": "IOT-SEN-04", "location": "Tailings Dam Wall B", "type": "Pore Water Piezometer", "reading": f"{random.uniform(45.0, 85.2):.1f} kPa", "status": "STABLE"}
    ]
    return sensors