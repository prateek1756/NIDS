from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.db = self.client[settings.DATABASE_NAME]
            # Try a simple command to check connection
            await self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.db = None

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

    async def save_alert(self, alert_data: dict):
        if self.db is not None:
            try:
                await self.db.alerts.insert_one(alert_data)
                return True
            except Exception as e:
                logger.error(f"Error saving alert: {e}")
        return False

    async def get_alerts(self, limit: int = 100):
        if self.db is not None:
            cursor = self.db.alerts.find({}, {"_id": 0}).sort("timestamp", -1)
            return await cursor.to_list(limit)
        return []

    def get_collection(self, name: str):
        if self.db is not None:
            return self.db[name]
        return None

db_service = DatabaseService()
