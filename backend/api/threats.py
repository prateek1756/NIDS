from fastapi import APIRouter
import random

router = APIRouter()

from backend.services.ml_engine import ml_engine
from backend.services.database import db_service

# ... (inside router)
@router.get("/predict")
async def predict_attack_trend():
    """
    Get AI-based attack prediction and anomaly trends.
    """
    return ml_engine.predict_trend()

@router.get("/map")
async def get_threat_map():
    """
    Get coordinates and info for current threats based on real detected alerts.
    """
    alerts = await db_service.get_alerts(limit=5)
    
    # Mocking geographic mapping for detected IPs
    # In production, this would use a GeoIP library
    threat_locations = []
    for i, alert in enumerate(alerts):
        # Deterministic but pseudo-random coordinates based on IP
        ip_parts = alert.get("features", {}).get("source_ip", "0.0.0.0").split(".")
        seed = int(ip_parts[-1]) if len(ip_parts) > 0 else 0
        
        threat_locations.append({
            "id": alert.get("id"),
            "lat": 20 + (seed % 40) - 20, # Range around equator/tropics
            "lng": 10 + (seed % 100) - 50,
            "city": f"Source {alert.get('features', {}).get('source_ip')}",
            "type": alert.get("attack_type", "Unknown"),
            "severity": "High" if alert.get("is_malicious") else "Low"
        })
    
    # Fallback if no real alerts found
    if not threat_locations:
        return [
            {"id": 1, "lat": 34.0522, "lng": -118.2437, "city": "Los Angeles", "type": "DoS", "severity": "High"},
            {"id": 5, "lat": 40.7128, "lng": -74.0060, "city": "New York", "type": "DoS", "severity": "Critical"}
        ]
        
    return threat_locations
