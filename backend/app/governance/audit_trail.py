import datetime
from typing import Dict, Any, List

class AuditTrailEngine:
    _AUDIT_LOGS: List[Dict[str, Any]] = []

    @classmethod
    def record_event(cls, event_type: str, zone_id: str, severity: str, details: str):
        record = {
            "audit_id": f"AUD-{int(datetime.datetime.now().timestamp())}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "zone_id": zone_id,
            "severity": severity,
            "details": details,
            "hash_signature": f"0x7f8c...{int(datetime.datetime.now().timestamp())}"
        }
        cls._AUDIT_LOGS.insert(0, record)
        return record

    @classmethod
    def get_all_audits(cls) -> List[Dict[str, Any]]:
        return cls._AUDIT_LOGS