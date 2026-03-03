from collections import deque
import pickle
import os
import numpy as np
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MLEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.history = deque(maxlen=100)  # Store last 100 historical snapshots
        self.load_model()

    def update_history(self, snapshot: dict):
        """Add a traffic snapshot to history for trend analysis"""
        self.history.append(snapshot)

    def predict_trend(self) -> dict:
        """
        Predict attack trends based on historical anomalies.
        If current metrics are >2 std devs from mean, flag as a predicted spike.
        """
        if len(self.history) < 10:
            return {"status": "Collecting data", "anomaly_score": 0}

        # Calculate mean/std for key metrics
        metric = "packet_count"
        values = [h.get(metric, 0) for h in self.history]
        mean = sum(values) / len(values)
        std = np.std(values)

        current_val = values[-1]
        z_score = (current_val - mean) / std if std > 0 else 0

        is_anomaly = z_score > 2.0  # 95% confidence interval spike
        
        return {
            "status": "High Risk" if is_anomaly else "Normal",
            "anomaly_score": round(float(z_score), 2),
            "prediction": "Possible incoming DDoS or Scan spike" if is_anomaly else "Steady traffic flow",
            "confidence": 0.8 if is_anomaly else 0.95
        }

    def load_model(self):
        try:
            if os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.SCALER_PATH):
                with open(settings.MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                with open(settings.SCALER_PATH, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("ML Model and Scaler loaded successfully.")
            else:
                logger.warning("ML Model or Scaler not found. Using heuristic fallback.")
        except Exception as e:
            logger.error(f"Error loading model: {e}. Using heuristic fallback.")

    def predict(self, features: dict) -> dict:
        """
        Predict if the traffic is malicious.
        Features should be a list/array of values in the order expected by the model.
        """
        if self.model and self.scaler:
            try:
                # Convert features dict to array in correct order (simplification for now)
                feature_values = np.array(list(features.values())).reshape(1, -1)
                scaled_features = self.scaler.transform(feature_values)
                prediction = self.model.predict(scaled_features)[0]
                probability = self.model.predict_proba(scaled_features)[0].tolist()
                
                return {
                    "is_malicious": bool(prediction != 0),
                    "attack_type": str(prediction),
                    "confidence": max(probability),
                    "method": "ML"
                }
            except Exception as e:
                logger.error(f"ML Prediction failed: {e}. Falling back to heuristics.")
        
        return self.heuristic_predict(features)

    def heuristic_predict(self, features: dict) -> dict:
        """
        Refined heuristic logic using enhanced features.
        """
        score = 0
        attack_sub_type = "Anomaly"

        # 1. Volume-based (DoS)
        if features.get("dst_bytes", 0) > 1000000: score += 0.4
        if features.get("count", 0) > 200: 
            score += 0.4
            attack_sub_type = "Potential DoS"

        # 2. Protocol specific (SYN Flood)
        if features.get("protocol_type") == "tcp" and features.get("tcp_flags") == "S":
            if features.get("count", 0) > 50:
                score += 0.5
                attack_sub_type = "SYN Flood"

        # 3. Spoofing indicators (Low TTL)
        if features.get("ttl", 255) < 32:
            score += 0.2 # Suspicious but not definitive alone

        # 4. Unusual Service behavior
        if features.get("service") == "other" and features.get("dst_bytes", 0) > 50000:
            score += 0.3

        is_malicious = score >= 0.5
        return {
            "is_malicious": is_malicious,
            "attack_type": attack_sub_type if is_malicious else "Normal",
            "confidence": round(min(score, 1.0), 2) if is_malicious else round(1 - score, 2),
            "method": "Heuristic (Enhanced)"
        }

ml_engine = MLEngine()
