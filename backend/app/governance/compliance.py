class ComplianceEngine:
    def __init__(self):
        pass

    @staticmethod
    def evaluate_compliance(*args, **kwargs):
        # Flexible argument handler to prevent TypeError
        violations = kwargs.get("violations", args[0] if args else 3)
        status = "COMPLIANT" if violations < 5 else "CRITICAL_NON_COMPLIANT"
        return {
            "status": status,
            "pending_violations": violations,
            "fine_estimated": violations * 10000
        }