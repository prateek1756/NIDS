import logging
from typing import List, Set
from datetime import datetime
from backend.services.database import db_service

logger = logging.getLogger(__name__)

class IPSService:
    """
    Intrusion Prevention System (IPS) Service
    Handles automatic and manual IP blocking.
    """
    def __init__(self):
        pass

    @property
    def collection(self):
        return db_service.get_collection("blocked_ips")

    async def block_ip(self, ip_address: str, reason: str, category: str = "Unknown"):
        """Block an IP address by adding it to the database"""
        try:
            # Check if already blocked
            existing = await self.collection.find_one({"ip_address": ip_address})
            if existing:
                logger.info(f"IP {ip_address} is already blocked.")
                return

            block_data = {
                "ip_address": ip_address,
                "reason": reason,
                "category": category,
                "blocked_at": datetime.utcnow(),
                "status": "active"
            }
            await self.collection.insert_one(block_data)
            logger.info(f"SUCCESSFULLY BLOCKED IP: {ip_address} | Reason: {reason}")
        except Exception as e:
            logger.error(f"Failed to block IP {ip_address}: {e}")

    async def unblock_ip(self, ip_address: str):
        """Unblock an IP address"""
        try:
            await self.collection.delete_one({"ip_address": ip_address})
            logger.info(f"UNBLOCKED IP: {ip_address}")
        except Exception as e:
            logger.error(f"Failed to unblock IP {ip_address}: {e}")

    async def get_blocked_ips(self) -> List[dict]:
        """Retrieve all currently blocked IPs"""
        try:
            cursor = self.collection.find({"status": "active"})
            return await cursor.to_list(length=100)
        except Exception as e:
            logger.error(f"Failed to fetch blocked IPs: {e}")
            return []

    async def is_blocked(self, ip_address: str) -> bool:
        """Check if an IP address is currently blocked"""
        try:
            count = await self.collection.count_documents({"ip_address": ip_address})
            return count > 0
        except Exception as e:
            logger.error(f"Error checking block status for {ip_address}: {e}")
            return False

ips_service = IPSService()
