from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
origins = [
    "http://localhost:5173", # Vite local port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Initialize the SQLite/PostgreSQL schema and seed default values (roles, prompt template)
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Adaptive AI Monitoring Platform API!"}

app.include_router(api_router, prefix=settings.API_V1_STR)
