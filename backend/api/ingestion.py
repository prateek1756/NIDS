from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.ingestion import ingestion_service
from backend.services.forensics import forensics_engine
from typing import List, Dict, Any

router = APIRouter()

@router.post("/upload")
async def upload_package(file: UploadFile = File(...)):
    """
    Unified endpoint to upload CSV, PCAP, or LOG files.
    """
    content = await file.read()
    try:
        # 1. Parse data
        data = ingestion_service.process_file(content, file.filename)
        
        # 2. Run forensics
        forensics_engine.ingest_data(data)
        analysis = await forensics_engine.analyze()
        
        return {
            "filename": file.filename,
            "events_count": len(data),
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/current-graph")
async def get_current_graph():
    """
    Get the latest analyzed graph data.
    """
    return await forensics_engine.analyze()
