import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adaptive AI Monitoring Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeychangeinproduction"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # SQLite default, override with PostgreSQL in prod
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./app.db"
    
    OPENAI_API_KEY: str = "mock-key"  # Can be overridden by env var

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
