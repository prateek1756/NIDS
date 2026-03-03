import logging
from typing import List, Set
from datetime import datetime
from backend.services.database import db_service

logger = logging.getLogger(__name__)

import subprocess
import os

class IPSService:
    """
    Intrusion Prevention System (IPS) Service
    Handles automatic and manual IP blocking with real OS integration.
    """
    def __init__(self):
        self.is_windows = os.name == 'nt'

    @property
    def collection(self):
        return db_service.get_collection("blocked_ips")

    async def block_ip(self, ip_address: str, reason: str, category: str = "Unknown"):
        """Block an IP address by adding it to the database and OS firewall"""
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
            
            # Apply real OS Firewall rule
            if self.is_windows:
                self._apply_os_block(ip_address)
            
            logger.info(f"SUCCESSFULLY BLOCKED IP: {ip_address} | Reason: {reason}")
        except Exception as e:
            logger.error(f"Failed to block IP {ip_address}: {e}")

    async def unblock_ip(self, ip_address: str):
        """Unblock an IP address from DB and OS firewall"""
        try:
            await self.collection.delete_one({"ip_address": ip_address})
            
            if self.is_windows:
                self._remove_os_block(ip_address)
                
            logger.info(f"UNBLOCKED IP: {ip_address}")
        except Exception as e:
            logger.error(f"Failed to unblock IP {ip_address}: {e}")

    def _apply_os_block(self, ip_address: str):
        """Execute Windows netsh command to block IP"""
        rule_name = f"NIDS_BLOCK_{ip_address.replace('.', '_')}"
        cmd = f'netsh advfirewall firewall add rule name="{rule_name}" dir=in action=block remoteip={ip_address}'
        try:
            # shell=True is needed for complex command strings on Windows
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"OS Firewall updated: Blocked {ip_address}")
            else:
                logger.warning(f"OS Firewall update FAILED (Admin required?): {result.stderr}")
        except Exception as e:
            logger.error(f"Error executing OS block command: {e}")

    def _remove_os_block(self, ip_address: str):
        """Execute Windows netsh command to remove IP block"""
        rule_name = f"NIDS_BLOCK_{ip_address.replace('.', '_')}"
        cmd = f'netsh advfirewall firewall delete rule name="{rule_name}"'
        try:
            subprocess.run(cmd, shell=True, capture_output=True)
            logger.info(f"OS Firewall updated: Unblocked {ip_address}")
        except Exception as e:
            logger.error(f"Error removing OS block rule: {e}")

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
