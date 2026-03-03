from fastapi import APIRouter, HTTPException
from typing import List
from backend.services.ips_service import ips_service

router = APIRouter()

@router.get("/blocked")
async def get_blocked_ips():
    """Retrieve all blocked IPs"""
    return await ips_service.get_blocked_ips()

@router.post("/block/{ip}")
async def block_ip(ip: str, reason: str = "Manual blocking"):
    """Manually block an IP"""
    await ips_service.block_ip(ip, reason, "Manual")
    return {"message": f"IP {ip} blocked successfully"}

@router.post("/unblock/{ip}")
async def unblock_ip(ip: str):
    """Manually unblock an IP"""
    await ips_service.unblock_ip(ip)
    return {"message": f"IP {ip} unblocked successfully"}

@router.get("/check/{ip}")
async def check_ip(ip: str):
    """Check if an IP is blocked"""
    is_blocked = await ips_service.is_blocked(ip)
    return {"ip": ip, "is_blocked": is_blocked}
