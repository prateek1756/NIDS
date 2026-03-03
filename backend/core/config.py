from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-NIDS"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "nids_db")
    
    # ML settings
    MODEL_PATH: str = "ml/models/nids_model.pkl"
    SCALER_PATH: str = "ml/models/scaler.pkl"
    HEURISTIC_FALLBACK: bool = True
    
    # Security
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True

settings = Settings()
