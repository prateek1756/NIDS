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
    alerts = await db_service.get_alerts(limit=15)
    
    # Predefined interesting global coordinates for better visualization if random seed is low
    GLOBAL_HUBS = [
        {"lat": 37.7749, "lng": -122.4194, "city": "San Francisco"},
        {"lat": 51.5074, "lng": -0.1278, "city": "London"},
        {"lat": 35.6762, "lng": 139.6503, "city": "Tokyo"},
        {"lat": -33.8688, "lng": 151.2093, "city": "Sydney"},
        {"lat": 1.3521, "lng": 103.8198, "city": "Singapore"},
        {"lat": 55.7558, "lng": 37.6173, "city": "Moscow"},
        {"lat": -23.5505, "lng": -46.6333, "city": "São Paulo"},
        {"lat": 28.6139, "lng": 77.2090, "city": "New Delhi"},
        {"lat": 30.0444, "lng": 31.2357, "city": "Cairo"},
        {"lat": 39.9042, "lng": 116.4074, "city": "Beijing"}
    ]

    threat_locations = []
    
    # Use real alerts if available
    for i, alert in enumerate(alerts):
        ip = alert.get("features", {}).get("source_ip", "0.0.0.0")
        ip_parts = ip.split(".")
        seed = sum(int(p) for p in ip_parts) if len(ip_parts) == 4 else random.randint(0, 100)
        
        # Mix in some randomness with deterministic seed
        hub = GLOBAL_HUBS[seed % len(GLOBAL_HUBS)]
        lat_offset = (seed % 10) - 5
        lng_offset = ((seed * 7) % 10) - 5
        
        threat_locations.append({
            "id": f"alert-{i}-{seed}",
            "lat": hub["lat"] + lat_offset,
            "lng": hub["lng"] + lng_offset,
            "city": f"{hub['city']} (via {ip})",
            "type": alert.get("attack_type", "Anomaly"),
            "severity": "Critical" if alert.get("risk_score", 0) > 0.8 else "High" if alert.get("is_malicious") else "Medium"
        })
    
    # Fallback/Supplemental mock data for a busy map
    if len(threat_locations) < 8:
        for i in range(8 - len(threat_locations)):
            hub = random.choice(GLOBAL_HUBS)
            attack_types = ["DoS", "Probe", "R2L", "U2R", "Brute Force"]
            severities = ["Low", "Medium", "High", "Critical"]
            
            threat_locations.append({
                "id": f"mock-{i}",
                "lat": hub["lat"] + random.uniform(-10, 10),
                "lng": hub["lng"] + random.uniform(-10, 10),
                "city": hub["city"],
                "type": random.choice(attack_types),
                "severity": random.choice(severities)
            })
        
    return threat_locations
