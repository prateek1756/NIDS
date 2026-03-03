from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.services.settings_service import settings_service

router = APIRouter()

@router.get("/")
async def get_all_settings():
    """Retrieve current system settings"""
    return await settings_service.get_settings()

@router.post("/")
async def update_system_settings(settings: Dict[str, Any]):
    """Update system settings"""
    success = await settings_service.update_settings(settings)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update settings")
    return {"status": "success", "message": "Settings updated"}

@router.get("/{key}")
async def get_single_setting(key: str):
    """Retrieve a specific setting value"""
    value = await settings_service.get_setting(key)
    if value is None:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return {key: value}
