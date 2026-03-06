from collections import deque
import pickle
import os
import numpy as np
import logging

try:
    from backend.core.config import settings
except ImportError:
    # Fallback if settings not available
    class Settings:
        MODEL_PATH = "ml/models/nids_model.pkl"
        SCALER_PATH = "ml/models/scaler.pkl"
        ENCODER_PATH = "ml/models/encoders.pkl"
    settings = Settings()

logger = logging.getLogger(__name__)

class MLEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = None
        self.history = deque(maxlen=100)
        self.load_model()

    def load_model(self):
        try:
            model_path = settings.MODEL_PATH
            scaler_path = settings.SCALER_PATH
            encoder_path = getattr(settings, "ENCODER_PATH", "ml/models/encoders.pkl")

            if os.path.exists(model_path) and os.path.exists(scaler_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                
                if os.path.exists(encoder_path):
                    with open(encoder_path, 'rb') as f:
                        self.encoders = pickle.load(f)
                
                logger.info("ML Model, Scaler, and Encoders loaded successfully.")
            else:
                logger.warning(f"ML Model artifacts not found at {model_path}. Using heuristic fallback.")
        except Exception as e:
            logger.error(f"Error loading model: {e}. Using heuristic fallback.")

    def predict(self, features: dict) -> dict:
        """
        Advanced ML prediction using Random Forest and NSL-KDD features.
        """
        if self.model and self.scaler and self.encoders:
            try:
                # 1. Map features to the order and type expected by the model
                # Features order: protocol_type, service, flag, src_bytes, dst_bytes, count, srv_count, serror_rate
                
                def encode_val(encoder_name, val):
                    le = self.encoders.get(encoder_name)
                    if not le: return 0
                    try:
                        # Find the label or use the first class as fallback
                        if val in le.classes_:
                            return le.transform([val])[0]
                        return 0
                    except:
                        return 0

                processed_features = [
                    encode_val('protocol_type', features.get('protocol_type', 'tcp')),
                    encode_val('service', features.get('service', 'other')),
                    encode_val('flag', features.get('flag', 'SF')),
                    features.get('src_bytes', 0),
                    features.get('dst_bytes', 0),
                    features.get('count', 1),
                    features.get('srv_count', 1),
                    features.get('serror_rate', 0.0)
                ]

                import pandas as pd
                cols = ['protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 'serror_rate']
                feature_df = pd.DataFrame([processed_features], columns=cols)
                scaled_features = self.scaler.transform(feature_df)
                
                prediction = self.model.predict(scaled_features)[0]
                probability = self.model.predict_proba(scaled_features)[0].tolist()
                
                attack_map = {0: "Normal", 1: "DoS", 2: "Probe"}
                attack_type = attack_map.get(int(prediction), "Unknown Anomaly")
                
                return {
                    "is_malicious": bool(prediction != 0),
                    "attack_type": attack_type,
                    "confidence": round(max(probability), 2),
                    "method": "Random Forest (ML)"
                }
            except Exception as e:
                logger.error(f"ML Prediction failed: {e}. Falling back to heuristics.")
        
        return self.heuristic_predict(features)

    def heuristic_predict(self, features: dict) -> dict:
        score = 0
        attack_sub_type = "Anomaly"

        if features.get("dst_bytes", 0) > 1000000: score += 0.4
        if features.get("count", 0) > 200: 
            score += 0.4
            attack_sub_type = "Potential DoS"

        if features.get("protocol_type") == "tcp" and features.get("tcp_flags") == "S":
            if features.get("count", 0) > 50:
                score += 0.5
                attack_sub_type = "SYN Flood"

        is_malicious = score >= 0.5
        return {
            "is_malicious": is_malicious,
            "attack_type": attack_sub_type if is_malicious else "Normal",
            "confidence": round(min(score, 1.0), 2) if is_malicious else round(1 - score, 2),
            "method": "Heuristic (Fallback)"
        }

    def update_history(self, snapshot: dict):
        self.history.append(snapshot)

    def predict_trend(self) -> dict:
        if len(self.history) < 10:
            return {"status": "Collecting data", "anomaly_score": 0}

        metric = "packet_count"
        values = [h.get(metric, 0) for h in self.history]
        mean = sum(values) / len(values)
        std = np.std(values)

        current_val = values[-1]
        z_score = (current_val - mean) / std if std > 0 else 0

        is_anomaly = z_score > 2.0
        
        return {
            "status": "High Risk" if is_anomaly else "Normal",
            "anomaly_score": round(float(z_score), 2),
            "prediction": "Possible incoming DDoS or Scan spike" if is_anomaly else "Steady traffic flow",
            "confidence": 0.8 if is_anomaly else 0.95
        }

ml_engine = MLEngine()
