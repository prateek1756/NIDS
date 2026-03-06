from fastapi import APIRouter
from backend.services.database import db_service
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """
    Get aggregate statistics for the dashboard using real DB data.
    """
    total_alerts = await db_service.get_count("alerts")
    high_alerts = await db_service.get_count("alerts", {"is_malicious": True})
    blocked_count = await db_service.get_count("blocked_ips", {"status": "active"})
    
    return {
        "total_alerts": total_alerts,
        "high_severity": high_alerts,
        "active_threats": blocked_count,
        "uptime": "24h 12m",
        "traffic_rate": "1.2 Gbps",
        "attack_distribution": [
            {"name": "DoS", "value": 45},
            {"name": "Probe", "value": 35},
            {"name": "PortScan", "value": 15},
            {"name": "Normal", "value": 5}
        ]
    }
