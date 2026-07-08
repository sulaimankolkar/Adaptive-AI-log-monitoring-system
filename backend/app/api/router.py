from fastapi import APIRouter
from app.api.v1 import auth, datasets, drift, prompts, insights, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(drift.router, prefix="/drift", tags=["drift"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
