from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from backend.core.config import settings
from backend.api import detection, dashboard, threats, ingestion, ips, reporting, settings as api_settings
from backend.services.database import db_service

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_service.connect()
    # Start traffic simulation in the background and store it
    simulation_task = asyncio.create_task(detection.simulate_traffic())
    yield
    # Shutdown
    simulation_task.cancel()
    try:
        await simulation_task
    except asyncio.CancelledError:
        pass
    await db_service.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(detection.router, prefix=settings.API_V1_STR + "/detection", tags=["detection"])
app.include_router(detection.router, prefix=settings.API_V1_STR + "/alerts", tags=["alerts"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR + "/dashboard", tags=["dashboard"])
app.include_router(threats.router, prefix=settings.API_V1_STR + "/threats", tags=["threats"])
app.include_router(ingestion.router, prefix=settings.API_V1_STR + "/ingestion", tags=["Ingestion"])
app.include_router(ips.router, prefix=settings.API_V1_STR + "/ips", tags=["ips"])
app.include_router(reporting.router, prefix=settings.API_V1_STR + "/reporting", tags=["reporting"])
app.include_router(api_settings.router, prefix=settings.API_V1_STR + "/settings", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI-Based NIDS API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
