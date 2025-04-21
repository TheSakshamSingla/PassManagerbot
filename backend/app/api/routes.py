from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
from pydantic import BaseModel
import hashlib
import hmac
import json
import urllib.parse
from ..core.auth import validate_telegram_init_data
from ..db.crud import store_password, get_password, list_passwords, delete_password
from ..core.config import settings

router = APIRouter()

class PasswordData(BaseModel):
    label: str
    encrypted_data: str
    iv: str
    hash: str  # SHA-256 checksum for integrity verification

class PasswordResponse(BaseModel):
    label: str
    encrypted_data: str
    iv: str
    hash: str

@router.post("/store", status_code=201)
async def store(password_data: PasswordData, request: Request):
    # Validate Telegram auth
    telegram_user_id = await validate_telegram_init_data(request)
    if not telegram_user_id:
        raise HTTPException(status_code=401, detail="Invalid Telegram authentication")
    
    # Store the encrypted password
    try:
        await store_password(
            user_id=telegram_user_id,
            label=password_data.label,
            encrypted_data=password_data.encrypted_data,
            iv=password_data.iv,
            hash_value=password_data.hash
        )
        return {"message": f"Password for '{password_data.label}' stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", response_model=List[str])
async def list_all(request: Request):
    # Validate Telegram auth
    telegram_user_id = await validate_telegram_init_data(request)
    if not telegram_user_id:
        raise HTTPException(status_code=401, detail="Invalid Telegram authentication")
    
    # Get all password labels for this user
    try:
        labels = await list_passwords(telegram_user_id)
        return labels
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get/{label}", response_model=PasswordResponse)
async def get(label: str, request: Request):
    # Validate Telegram auth
    telegram_user_id = await validate_telegram_init_data(request)
    if not telegram_user_id:
        raise HTTPException(status_code=401, detail="Invalid Telegram authentication")
    
    # Get the encrypted password
    try:
        password_data = await get_password(telegram_user_id, label)
        if not password_data:
            raise HTTPException(status_code=404, detail=f"Password for '{label}' not found")
        
        return PasswordResponse(
            label=label,
            encrypted_data=password_data["encrypted_data"],
            iv=password_data["iv"],
            hash=password_data["hash"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{label}")
async def delete(label: str, request: Request):
    # Validate Telegram auth
    telegram_user_id = await validate_telegram_init_data(request)
    if not telegram_user_id:
        raise HTTPException(status_code=401, detail="Invalid Telegram authentication")
    
    # Delete the password
    try:
        success = await delete_password(telegram_user_id, label)
        if not success:
            raise HTTPException(status_code=404, detail=f"Password for '{label}' not found")
        
        return {"message": f"Password for '{label}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))