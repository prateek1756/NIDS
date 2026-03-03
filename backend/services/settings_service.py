import logging
from typing import Dict, Any
from backend.services.database import db_service

logger = logging.getLogger(__name__)

class SettingsService:
    """
    Manages persistent system settings stored in MongoDB.
    """
    DEFAULT_SETTINGS = {
        "auto_block": True,
        "alert_sensitivity": 0.5,
        "log_retention_days": 30,
        "system_name": "AI-NIDS Sentinel",
        "email_alerts": True,
        "desktop_notifications": True
    }

    def __init__(self):
        pass

    @property
    def collection(self):
        return db_service.get_collection("system_settings")

    async def get_settings(self) -> Dict[str, Any]:
        """Fetch settings from DB or return defaults"""
        try:
            settings_doc = await self.collection.find_one({"type": "global_config"}, {"_id": 0})
            if not settings_doc:
                # Initialize with defaults if empty
                await self.collection.insert_one({"type": "global_config", **self.DEFAULT_SETTINGS})
                return self.DEFAULT_SETTINGS
            
            # Merge with defaults to ensure all keys exist
            return {**self.DEFAULT_SETTINGS, **settings_doc}
        except Exception as e:
            logger.error(f"Error fetching settings: {e}")
            return self.DEFAULT_SETTINGS

    async def update_settings(self, new_settings: Dict[str, Any]) -> bool:
        """Update settings in MongoDB"""
        try:
            # Filter out internal fields
            update_data = {k: v for k, v in new_settings.items() if k != "type"}
            await self.collection.update_one(
                {"type": "global_config"},
                {"$set": update_data},
                upsert=True
            )
            logger.info("System settings updated successfully.")
            return True
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return False

    async def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a single setting value"""
        settings = await self.get_settings()
        return settings.get(key, default)

settings_service = SettingsService()
