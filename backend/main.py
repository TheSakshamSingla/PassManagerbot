from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.routes import router as api_router

app = FastAPI(title="Secure Password Manager API")

# Configure CORS for Telegram Mini App
telegram_mini_app_domain = os.getenv("TELEGRAM_MINI_APP_DOMAIN", "https://your-frontend-domain.vercel.app")
origins = [
    telegram_mini_app_domain,
    "https://web.telegram.org",  # Add Telegram web app domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Secure Password Manager API is running"}