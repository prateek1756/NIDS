from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from backend.services.reporting import reporting_engine
from backend.services.database import db_service
import os

router = APIRouter()

@router.post("/generate")
async def generate_report(background_tasks: BackgroundTasks, data: dict = None):
    """
    Generate a new forensic report.
    Expects 'stats' and 'alerts' in the body. If none provided, fetches from DB.
    """
    try:
        stats = data.get('stats') if data else None
        alerts = data.get('alerts') if data else None
        
        if not stats or not alerts:
            # Fallback to fetching latest data from DB
            stats_list = await db_service.get_dashboard_stats()
            stats = stats_list[0] if stats_list else {}
            alerts = await db_service.get_alerts(limit=50)

        filename = reporting_engine.generate_report(stats, alerts)
        return {"message": "Report generation initiated", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_reports():
    return reporting_engine.list_reports()

@router.get("/download/{filename}")
async def download_report(filename: str):
    file_path = os.path.join(reporting_engine.report_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(path=file_path, filename=filename, media_type='text/markdown')
