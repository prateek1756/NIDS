from fastapi import APIRouter, BackgroundTasks, HTTPException
from backend.services.packet_processor import packet_processor
from backend.services.ml_engine import ml_engine
from backend.services.database import db_service
from datetime import datetime
import asyncio
import uuid
import random

router = APIRouter()

async def simulate_traffic():
    """
    Background task to simulate constant network traffic and detections.
    """
    while True:
        try:
            # Simulate a packet every few seconds
            await asyncio.sleep(random.uniform(2, 7))
            
            raw_packet = None 
            features = packet_processor.extract_features(raw_packet)
            
            # Inject some random variations for simulation
            features["src_bytes"] = random.randint(100, 5000)
            if random.random() < 0.2: # 20% chance of alert
                features["count"] = random.randint(150, 500)
                features["srv_count"] = random.randint(150, 500)

            # Feed history for trend prediction
            ml_engine.update_history({
                "timestamp": datetime.utcnow(),
                "packet_count": features.get("count", 0),
                "byte_count": features.get("src_bytes", 0)
            })

            result = ml_engine.predict(features)
            
            alert = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow(),
                "is_malicious": result["is_malicious"],
                "attack_type": result["attack_type"],
                "confidence": result["confidence"],
                "method": result["method"],
                "features": features
            }
            
            if result["is_malicious"]:
                await db_service.save_alert(alert)
        except Exception as e:
            print(f"Simulation error: {e}")

@router.post("/analyze")
async def analyze_traffic(background_tasks: BackgroundTasks):
    """
    Simulate or analyze incoming traffic.
    In a real scenario, this might be triggered by a packet capture loop.
    """
    # Mocking a packet for the sake of the endpoint
    raw_packet = None 
    features = packet_processor.extract_features(raw_packet)
    result = ml_engine.predict(features)
    
    detection_id = str(uuid.uuid4())
    alert = {
        "id": detection_id,
        "timestamp": datetime.utcnow(),
        "is_malicious": result["is_malicious"],
        "attack_type": result["attack_type"],
        "confidence": result["confidence"],
        "method": result["method"],
        "features": features
    }
    
    if result["is_malicious"]:
        background_tasks.add_task(db_service.save_alert, alert)
    
    return alert

@router.get("/alerts")
async def get_alerts(limit: int = 50):
    return await db_service.get_alerts(limit)
