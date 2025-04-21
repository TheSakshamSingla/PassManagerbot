import os
from pydantic import BaseSettings
from typing import Dict, Any

class Settings(BaseSettings):
    APP_NAME: str = "Secure Password Manager"
    DEBUG: bool = False
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/passwordmanager")
    
    # Telegram settings
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_MINI_APP_DOMAIN: str = os.getenv("TELEGRAM_MINI_APP_DOMAIN", "https://your-frontend-domain.vercel.app")
    
    class Config:
        env_file = ".env"

settings = Settings()