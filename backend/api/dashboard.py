from fastapi import APIRouter
from backend.services.database import db_service
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """
    Get aggregate statistics for the dashboard.
    """
    # In a real app, these would be MongoDB aggregations
    return {
        "total_alerts": 1254,
        "high_severity": 42,
        "active_threats": 5,
        "uptime": "12d 4h 32m",
        "traffic_rate": "1.2 Gbps",
        "attack_distribution": [
            {"name": "DoS", "value": 400},
            {"name": "Probe", "value": 300},
            {"name": "R2L", "value": 200},
            {"name": "U2R", "value": 100},
            {"name": "Normal", "value": 254}
        ]
    }
