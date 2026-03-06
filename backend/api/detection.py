from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from backend.services.packet_processor import packet_processor
from backend.services.ml_engine import ml_engine
from backend.services.database import db_service
from datetime import datetime
import asyncio
import uuid
import random
import json
import logging

logger = logging.getLogger(__name__)
from backend.services.ips_service import ips_service

router = APIRouter()

# Global queue for live stream subscribers
live_updates_queue = asyncio.Queue()

def sniffer_callback(pkt, features):
    """
    Callback from the LiveSniffer when a new packet is captured.
    """
    # Run ML prediction
    result = ml_engine.predict(features)
    
    update = {
        "type": "traffic",
        "timestamp": datetime.utcnow().isoformat(),
        "is_malicious": result["is_malicious"],
        "attack_type": result["attack_type"],
        "confidence": result["confidence"],
        "features": features
    }
    
    # If malicious, save to DB and handle Auto-Mitigation
    if result["is_malicious"]:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Save alert
        loop.run_until_complete(db_service.save_alert(update))
        
        # ACTIVE PROTECTION: Auto-block high confidence threats
        if result["confidence"] >= 0.90:
            src_ip = features.get("src_ip")
            if src_ip and src_ip not in ["127.0.0.1", "0.0.0.0"]:
                loop.run_until_complete(ips_service.block_ip(
                    ip_address=src_ip,
                    reason=f"Auto-mitigated {result['attack_type']} (Confidence: {result['confidence']})",
                    category=result["attack_type"]
                ))
        
        update["type"] = "alert"
    
    # Push to live queue
    asyncio.run_coroutine_threadsafe(live_updates_queue.put(update), asyncio.get_event_loop())

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
            features["src_ip"] = f"192.168.1.{random.randint(2, 254)}"
            features["dst_ip"] = f"10.0.0.{random.randint(2, 254)}"
            
            if random.random() < 0.2: # 20% chance of alert
                features["count"] = random.randint(150, 500)
                features["srv_count"] = random.randint(150, 500)

            result = ml_engine.predict(features)
            
            update = {
                "type": "traffic",
                "id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "is_malicious": result["is_malicious"],
                "attack_type": result["attack_type"],
                "confidence": result["confidence"],
                "features": features
            }
            
            if result["is_malicious"]:
                await db_service.save_alert(update)
                update["type"] = "alert"
                
                # Simulate Auto-Blocking for high confidence
                if result["confidence"] >= 0.90:
                    await ips_service.block_ip(
                        ip_address=features["src_ip"],
                        reason=f"SIMULATED: Auto-mitigated {result['attack_type']}",
                        category=result["attack_type"]
                    )
            
            await live_updates_queue.put(update)
            
        except Exception as e:
            logger.error(f"Simulation error: {e}")

@router.get("/stream")
async def live_stream(request: Request):
    """
    SSE endpoint to push real-time updates to the dashboard.
    """
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            
            try:
                # Wait for new update from the queue
                update = await live_updates_queue.get()
                yield {
                    "event": "update",
                    "data": json.dumps(update)
                }
                live_updates_queue.task_done()
            except Exception as e:
                logger.error(f"Stream error: {e}")
                await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/toggle-live")
async def toggle_live(enabled: bool):
    """
    Start or stop the live network sniffer.
    """
    try:
        if enabled:
            packet_processor.subscribe(sniffer_callback)
            packet_processor.live_sniffer.start()
            return {"status": "Live sniffing started"}
        else:
            packet_processor.live_sniffer.stop()
            return {"status": "Live sniffing stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_alerts(limit: int = 50):
    return await db_service.get_alerts(limit)
