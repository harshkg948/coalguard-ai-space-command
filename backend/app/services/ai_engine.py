import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, Any

class MiningRiskAIEngine:
    def __init__(self):
        # Simulated pre-trained Random Forest model state for SIH prototype demo
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        # Dummy fit to initialize estimator attributes
        X_dummy = np.array([[200, 100, 10, 2], [300, 250, 20, 5], [150, 50, 5, 0]])
        y_dummy = np.array([4.5, 8.8, 2.1])
        self.model.fit(X_dummy, y_dummy)

    def predict_risk_score(self, pit_depth: float, worker_density: int, equipment_age: float, pending_violations: int) -> Dict[str, Any]:
        features = np.array([[pit_depth, worker_density, equipment_age, pending_violations]])
        predicted_score = float(self.model.predict(features)[0])
        
        # Clamp score between 1.0 and 10.0
        clamped_score = round(min(max(predicted_score, 1.0), 10.0), 1)
        
        classification = "CRITICAL" if clamped_score >= 7.5 else "MODERATE" if clamped_score >= 4.0 else "STABLE"
        
        return {
            "score": clamped_score,
            "classification": classification,
            "confidence_metric": 0.92
        }

ai_risk_engine = MiningRiskAIEngine()